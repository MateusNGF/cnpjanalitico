package main

import (
	"archive/zip"
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

const (
	BaseURL    = "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/2026-01/"
	MaxWorkers = 3 // Reduzido para evitar bloqueios de IP/Rate limit
	MaxRetries = 5
)

var (
	OutputDir = getEnv("OUTPUT_DIR", `W:\app\dados_temp`)
)

var targetFiles = []string{
	"ESTABELE", "EMPRE", "SOCIO", "CNAE", "MUNIC", "MOTI", "NATJU", "SIMPLES", "NATUREZA",
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	fmt.Println("--- CNPJ Downloader V4 (Robust Edition) ---")

	if err := os.MkdirAll(OutputDir, 0755); err != nil {
		fmt.Printf("Erro crítico ao criar diretório: %v\n", err)
		os.Exit(1)
	}

	files, err := getFilesFromURL(BaseURL)
	if err != nil {
		fmt.Printf("Erro ao listar arquivos no servidor: %v\n", err)
		os.Exit(1)
	}

	if len(files) == 0 {
		fmt.Println("Nenhum arquivo zip encontrado na URL informada.")
		return
	}

	fmt.Printf("Encontrados %d arquivos para download e extração.\n", len(files))

	p := mpb.New(mpb.WithWidth(60))

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, MaxWorkers)

	for _, filename := range files {
		wg.Add(1)
		go func(fname string) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			// Step 1: Download with Retries
			localPath, err := downloadWithRetry(p, BaseURL+fname, fname)
			if err != nil {
				fmt.Printf("\n[ERRO] Falha definitiva no download de %s: %v\n", fname, err)
				return
			}

			// Step 2: Extract
			if err := extractZip(p, localPath); err != nil {
				fmt.Printf("\n[ERRO] Falha na extração de %s: %v\n", fname, err)
			}
		}(filename)
	}

	wg.Wait()
	p.Wait()
	fmt.Println("\n--- Processo concluído com sucesso! ---")
}

func getFilesFromURL(url string) ([]string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("servidor retornou status %d", resp.StatusCode)
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
			for _, target := range targetFiles {
				if strings.Contains(hrefUpper, target) {
					files = append(files, href)
					break
				}
			}
		}
	})

	return files, nil
}

func downloadWithRetry(p *mpb.Progress, url, filename string) (string, error) {
	var err error
	for i := 1; i <= MaxRetries; i++ {
		path, dErr := downloadFile(p, url, filename)
		if dErr == nil {
			return path, nil
		}
		err = dErr
		fmt.Printf("\n[RETRY %d/%d] %s: %v\n", i, MaxRetries, filename, err)
		time.Sleep(time.Duration(i*2) * time.Second)
	}
	return "", err
}

func downloadFile(p *mpb.Progress, url, filename string) (string, error) {
	destPath := filepath.Join(OutputDir, filename)

	// Se o arquivo já existe e tem tamanho > 0, pulamos
	if info, err := os.Stat(destPath); err == nil && info.Size() > 0 {
		return destPath, nil
	}

	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("status HTTP %d", resp.StatusCode)
	}

	bar := p.AddBar(resp.ContentLength,
		mpb.PrependDecorators(
			decor.Name(filename, decor.WC{W: len(filename) + 1, C: decor.DindentRight}),
			decor.OnComplete(decor.AverageETA(decor.ET_STYLE_GO), "baixado"),
		),
		mpb.AppendDecorators(
			decor.CountersKibiByte("% .2f / % .2f"),
			decor.Percentage(decor.WC{W: 5}),
		),
	)

	out, err := os.Create(destPath)
	if err != nil {
		bar.Abort(true)
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, bar.ProxyReader(resp.Body))
	if err != nil {
		return "", err
	}

	return destPath, nil
}

func extractZip(p *mpb.Progress, src string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
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
			decor.Name(filename, decor.WC{W: len(filename) + 1, C: decor.DindentRight}),
			decor.OnComplete(decor.Name("extraindo", decor.WC{W: 10}), "concluído"),
		),
		mpb.AppendDecorators(
			decor.CountersKibiByte("% .2f / % .2f"),
		),
	)

	for _, f := range r.File {
		fpath := filepath.Join(OutputDir, f.Name)

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			bar.Abort(true)
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
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
			return err
		}
	}
	return nil
}
