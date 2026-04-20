package main

import (
	"archive/zip"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/vbauerster/mpb/v8"
	"github.com/vbauerster/mpb/v8/decor"
)

// FileMetadata tracks remote file state
type FileMetadata struct {
	LastModified string `json:"last_modified"`
	Size         int64  `json:"size"`
}

// Manifest keeps track of all downloaded files
type Manifest struct {
	Files map[string]FileMetadata `json:"files"`
}

const (
	BaseURL    = "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/2026-01/"
	IBGEAPIURL = "https://servicodados.ibge.gov.br/api/v2/cnae/subclasses"
)

// Config holds the application configuration
type Config struct {
	OutputDir  string
	MaxWorkers int
	MaxRetries int
}

// Downloader manages the download process
type Downloader struct {
	cfg         Config
	targetFiles []string
	startTime   time.Time
	manifest    *Manifest
	manifestMtx sync.Mutex
}

// CNAEItem represents an item from the IBGE API
type CNAEItem struct {
	ID        string `json:"id"`
	Descricao string `json:"descricao"`
}

func main() {
	// Parse Flags
	outputDir := flag.String("output", getEnv("OUTPUT_DIR", `W:\app\dados_temp`), "Directory to save downloaded files")
	workers := flag.Int("workers", 3, "Maximum number of concurrent downloads")
	retries := flag.Int("retries", 5, "Maximum number of retries for failed downloads")
	flag.Parse()

	cfg := Config{
		OutputDir:  *outputDir,
		MaxWorkers: *workers,
		MaxRetries: *retries,
	}

	app := &Downloader{
		cfg: cfg,
		targetFiles: []string{
			"ESTABELE", "EMPRE", "SOCIO", "MUNIC", "MOTI", "NATJU", "SIMPLES", "NATUREZA",
		},
		startTime: time.Now(),
		manifest:  &Manifest{Files: make(map[string]FileMetadata)},
	}

	app.loadManifest()
	app.Run()
}

func (d *Downloader) loadManifest() {
	path := filepath.Join(d.cfg.OutputDir, "manifest.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	json.Unmarshal(data, d.manifest)
}

func (d *Downloader) saveManifest() {
	d.manifestMtx.Lock()
	defer d.manifestMtx.Unlock()
	path := filepath.Join(d.cfg.OutputDir, "manifest.json")
	data, _ := json.MarshalIndent(d.manifest, "", "  ")
	os.WriteFile(path, data, 0644)
}

func (d *Downloader) Run() {
	d.printHeader()

	if err := os.MkdirAll(d.cfg.OutputDir, 0755); err != nil {
		fmt.Printf("❌ Critical Error: Could not create output directory: %v\n", err)
		os.Exit(1)
	}

	// 1. Download CNAEs
	d.downloadCNAEs()

	// 2. Discover Files
	files, err := d.getFilesFromURL(BaseURL)
	if err != nil {
		fmt.Printf("❌ Error listing files from server: %v\n", err)
		os.Exit(1)
	}

	if len(files) == 0 {
		fmt.Println("⚠️  No matching ZIP files found.")
		return
	}

	fmt.Printf("📦 Found %d files to process.\n", len(files))

	// 3. Process Files (Download & Extract)
	d.processFiles(files)

	d.printSummary(len(files))
}

func (d *Downloader) printHeader() {
	fmt.Println("==================================================")
	fmt.Println("       CNPJ Analytics - Data Downloader v5.1      ")
	fmt.Println("==================================================")
	fmt.Printf("📂 Output Dir : %s\n", d.cfg.OutputDir)
	fmt.Printf("🚀 Workers    : %d\n", d.cfg.MaxWorkers)
	fmt.Println("--------------------------------------------------")
}

func (d *Downloader) printSummary(totalFiles int) {
	duration := time.Since(d.startTime)
	fmt.Println("\n==================================================")
	fmt.Println("               Process Completed                  ")
	fmt.Println("==================================================")
	fmt.Printf("⏱️  Total Time : %s\n", duration.Round(time.Second))
	fmt.Printf("✅ Files processed: %d\n", totalFiles)
	fmt.Println("==================================================")
}

func (d *Downloader) downloadCNAEs() {
	fmt.Println("\n📡 [IBGE] Fetching CNAE data...")
	start := time.Now()

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(IBGEAPIURL)
	if err != nil {
		fmt.Printf("⚠️  [IBGE] Failed to connect: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Printf("⚠️  [IBGE] API returned status %d\n", resp.StatusCode)
		return
	}

	var cnaes []CNAEItem
	if err := json.NewDecoder(resp.Body).Decode(&cnaes); err != nil {
		fmt.Printf("⚠️  [IBGE] Failed to parse JSON: %v\n", err)
		return
	}

	csvPath := filepath.Join(d.cfg.OutputDir, "F.K03200$Z.D26014.CNAECSV")
	file, err := os.Create(csvPath)
	if err != nil {
		fmt.Printf("⚠️  [IBGE] Failed to create file: %v\n", err)
		return
	}
	defer file.Close()

	count := 0
	for _, cnae := range cnaes {
		desc := strings.ReplaceAll(cnae.Descricao, "\"", "\"\"")
		line := fmt.Sprintf("%s;%s\n", cnae.ID, desc)
		if _, err := file.WriteString(line); err == nil {
			count++
		}
	}

	fmt.Printf("✅ [IBGE] Saved %d CNAEs in %v (%s)\n", count, time.Since(start).Round(time.Millisecond), csvPath)
}

func (d *Downloader) getFilesFromURL(url string) ([]string, error) {
	fmt.Println("🔍 Scanning Receita Federal repository...")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("server returned status %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	var files []string
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		hrefUpper := strings.ToUpper(href)
		if strings.HasSuffix(strings.ToLower(href), ".zip") {
			for _, target := range d.targetFiles {
				if strings.Contains(hrefUpper, target) {
					files = append(files, href)
					break
				}
			}
		}
	})
	return files, nil
}

func (d *Downloader) processFiles(files []string) {
	p := mpb.New(mpb.WithWidth(60), mpb.WithRefreshRate(180*time.Millisecond))
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, d.cfg.MaxWorkers)

	for _, filename := range files {
		wg.Add(1)
		go func(fname string) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			// 1. Download
			localPath, err := d.downloadWithRetry(p, BaseURL+fname, fname)
			if err != nil {
				return
			}

			if localPath == "" {
				// File was skipped (already up to date)
				return
			}

			// 2. Extract
			if err := d.extractZip(p, localPath); err != nil {
				return
			}

			// 3. Update manifest and save
			d.updateManifestEntry(fname)
			d.saveManifest()

			// 4. Remove ZIP
			os.Remove(localPath)

		}(filename)
	}

	wg.Wait()
	p.Wait()
}

func (d *Downloader) updateManifestEntry(filename string) {
	d.manifestMtx.Lock()
	defer d.manifestMtx.Unlock()

	resp, err := http.Head(BaseURL + filename)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	d.manifest.Files[filename] = FileMetadata{
		LastModified: resp.Header.Get("Last-Modified"),
		Size:         resp.ContentLength,
	}
}

func (d *Downloader) downloadWithRetry(p *mpb.Progress, url, filename string) (string, error) {
	destPath := filepath.Join(d.cfg.OutputDir, filename)

	// Check manifest for incremental update
	resp, err := http.Head(url)
	if err == nil {
		defer resp.Body.Close()
		lastMod := resp.Header.Get("Last-Modified")
		size := resp.ContentLength

		d.manifestMtx.Lock()
		meta, exists := d.manifest.Files[filename]
		d.manifestMtx.Unlock()

		if exists && meta.LastModified == lastMod && meta.Size == size {
			// Also check if extracted file exists (optional, but safer)
			return "", nil
		}
	}

	var lastErr error
	for i := 1; i <= d.cfg.MaxRetries; i++ {
		err := d.downloadFile(p, url, filename, destPath)
		if err == nil {
			return destPath, nil
		}
		lastErr = err

		// Create a temporary error bar or log to avoid messing up main bars too much,
		// or just log to stdout if it's a transient packet loss.
		// For CLI cleanliness, we'll just sleep and retry silently unless it's a persistent issue.
		time.Sleep(time.Duration(i*2) * time.Second)
	}

	fmt.Printf("\n❌ Failed to download %s after %d retries: %v\n", filename, d.cfg.MaxRetries, lastErr)
	return "", lastErr
}

func (d *Downloader) downloadFile(p *mpb.Progress, url, filename, destPath string) error {
	req, err := http.NewRequestWithContext(context.Background(), "GET", url, nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	// Create Progress Bar
	bar := p.AddBar(resp.ContentLength,
		mpb.PrependDecorators(
			decor.Name("⬇️  "+filename, decor.WC{W: 30, C: decor.DindentRight}),
			decor.CountersKibiByte("% .2f / % .2f"),
		),
		mpb.AppendDecorators(
			decor.EwmaETA(decor.ET_STYLE_GO, 30),
			decor.Name(" ] "),
			decor.EwmaSpeed(1024, "% .2f", 30),
		),
	)

	out, err := os.Create(destPath)
	if err != nil {
		bar.Abort(true)
		return err
	}
	defer out.Close()

	proxyReader := bar.ProxyReader(resp.Body)
	_, err = io.Copy(out, proxyReader)
	if err != nil {
		bar.Abort(true)
		return err
	}

	return nil
}

func (d *Downloader) extractZip(p *mpb.Progress, src string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		fmt.Printf("\n❌ Error opening zip %s: %v\n", src, err)
		return err
	}
	defer r.Close()

	var totalSize int64
	for _, f := range r.File {
		totalSize += int64(f.UncompressedSize64)
	}

	filename := filepath.Base(src)
	bar := p.AddBar(totalSize,
		mpb.PrependDecorators(
			decor.Name("📂 "+filename, decor.WC{W: 30, C: decor.DindentRight}),
			decor.CountersKibiByte("% .2f / % .2f"),
		),
		mpb.AppendDecorators(
			decor.Name("EXTRACTING", decor.WC{W: 10, C: decor.DindentRight}),
			decor.OnComplete(decor.Percentage(decor.WC{W: 5}), "Done!"),
		),
		mpb.BarFillerMiddleware(func(filler mpb.BarFiller) mpb.BarFiller {
			return filler // Customize color here if needed
		}),
	)

	for _, f := range r.File {
		fpath := filepath.Join(d.cfg.OutputDir, f.Name)

		// Otimização: Se o arquivo já existe e tem o tamanho correto, podemos arriscar pular? 
		// Não, pois o ZIP mudou. Mas podemos usar um arquivo temporário para garantir atomicidade.
		tempPath := fpath + ".tmp"

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			bar.Abort(true)
			return err
		}

		outFile, err := os.OpenFile(tempPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			bar.Abort(true)
			return err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			bar.Abort(true)
			return err
		}

		_, err = io.Copy(outFile, bar.ProxyReader(rc))

		outFile.Close()
		rc.Close()

		if err != nil {
			os.Remove(tempPath)
			bar.Abort(true)
			return err
		}

		// Garantir atomicidade: renomear apenas se extração completa
		if err := os.Rename(tempPath, fpath); err != nil {
			bar.Abort(true)
			return err
		}
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
