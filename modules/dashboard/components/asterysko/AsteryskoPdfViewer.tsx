import React, { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface AsteryskoPdfViewerProps {
    url: string;
    title: string;
}

const PdfPage = ({ document, pageNumber, width }: { document: PDFDocumentProxy; pageNumber: number; width: number }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let cancelled = false;
        let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null;

        const render = async () => {
            const page = await document.getPage(pageNumber);
            if (cancelled || !canvasRef.current) return;
            const baseViewport = page.getViewport({ scale: 1 });
            const cssScale = Math.min(width / baseViewport.width, 2);
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const viewport = page.getViewport({ scale: cssScale * pixelRatio });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
            canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
            renderTask = page.render({ canvas, canvasContext: context, viewport });
            await renderTask.promise;
        };

        void render().catch(error => {
            if (!cancelled && error?.name !== 'RenderingCancelledException') console.error('Erro ao renderizar página do PDF:', error);
        });
        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [document, pageNumber, width]);

    return <canvas ref={canvasRef} className="ast-pdf-viewer__page" aria-label={`Página ${pageNumber}`} />;
};

const AsteryskoPdfViewer: React.FC<AsteryskoPdfViewerProps> = ({ url, title }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
    const [availableWidth, setAvailableWidth] = useState(320);
    const [error, setError] = useState('');

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        const updateWidth = () => setAvailableWidth(Math.max(240, Math.floor(element.clientWidth - 4)));
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setDocument(null);
        setError('');
        const loadingTask = getDocument({ url });
        void loadingTask.promise
            .then(setDocument)
            .catch(loadError => {
                console.error('Erro ao carregar PDF:', loadError);
                setError('Não foi possível exibir este PDF. Você ainda pode baixá-lo pelo botão acima.');
            });
        return () => {
            void loadingTask.destroy();
        };
    }, [url]);

    return (
        <div className="ast-pdf-viewer" ref={containerRef} aria-label={title}>
            {!document && !error && <div className="ast-pdf-viewer__loading"><span className="ast-spinner" /> Carregando documento...</div>}
            {error && <p className="ast-pdf-viewer__error">{error}</p>}
            {document && Array.from({ length: document.numPages }, (_, index) => (
                <PdfPage document={document} pageNumber={index + 1} width={availableWidth} key={index + 1} />
            ))}
        </div>
    );
};

export default AsteryskoPdfViewer;
