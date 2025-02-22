// npm install pdfjs-dist --save-dev
//
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, use } from "react";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

class PDF_VIEW {
  constructor() {
    this.lip = pdfjsLib;
    this.pdf = null;
    this.page = new Map();
    this.render = null;
    this.LoadedPDF = false;
    this.LoadedPage = false;
    this.isRender = false;
    this.renderTask = null;
  }

  async loadPdf(url) {
    if (!this.lip) return;
    try {
      this.pdf = await this.lip.getDocument(url).promise;
      this.LoadedPDF = true;
    } catch (error) {
      console.error("=> error obj load pdf : " + error);
    }
  }

  async loadPage(number) {
    if (!number) return;
    try {
      const resultLoadPage = await this.pdf.getPage(number);
      this.page.set(number, resultLoadPage);
      this.LoadedPage = true;
      return resultLoadPage;
    } catch (error) {
      console.error("=> error obj load page : " + error);
    }
  }

  async renderPage(canvasRef, pageNumber, scale, rotation) {
    if (this.page.size === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = this.page
      .get(pageNumber)
      .getViewport({ scale: scale || 1, rotation: 0 });
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    this.page.get(pageNumber).render(renderContext);
  }

  get isLoadedPdf() {
    return this.LoadedPDF;
  }
  get isLoadedPage() {
    return this.LoadedPage;
  }
}

export default function Xy() {
  const PDF = new PDF_VIEW();
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");

  const canvas = useRef(null);
  const canvas2 = useRef(null);
  async function mypdf() {
    await PDF.loadPdf(url);
    for (let i = 1; i <= 10; i++) {
      await PDF.loadPage(i);
    }
    PDF.renderPage(canvas, 1);
  }

  mypdf();
  return (
    <div className="h-full gap-2  flex flex-col justify-center items-center overflow-auto">
      <canvas
        ref={canvas}
        id="canvas-pdf"
        className="shadow-md w-full "
      ></canvas>
      <canvas
        ref={canvas2}
        id="canvas-pdf"
        className="shadow-md w-full "
      ></canvas>
    </div>
  );
}
