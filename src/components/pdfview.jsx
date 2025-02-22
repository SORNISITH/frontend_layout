// npm install pdfjs-dist --save-dev
//
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, createRef } from "react";
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

    // fix error render canvas
    this.pageRendering = false;
    this.pageNumPending = null;
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

    if (this.pageRendering) {
      this.pageRendering = pageNumber;
    } else {
      this.pageRendering = true;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = await this.page
        .get(pageNumber)
        .getViewport({ scale: scale || 1, rotation: 0 });
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = this.page.get(pageNumber).render(renderContext);

      renderTask.promise.then(() => {
        this.pageRendering = false;
        if (this.pageNumPending !== null) {
          // Waited page must be rendered
          this.renderPage(canvasRef, pageNumber, scale, rotation);
          // Must be set to null to prevent infinite loop
          this.pageNumPending = null;
        }
      });
    }
  }

  get isLoadedPdf() {
    return this.LoadedPDF;
  }

  get isLoadedPage() {
    return this.LoadedPage;
  }
}

/// global this for fix render canvas error
//-------------------------------------------------------------------------------
const PDF = new PDF_VIEW();

export default function PdfView() {
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");
  const canvas = useRef([...Array(10)].map(() => createRef()));
  async function mypdf() {
    await PDF.loadPdf(url);
    for (let i = 1; i <= 10; i++) {
      await PDF.loadPage(i);
    }
    await PDF.renderPage(canvas.current[0], 1).promise;
  }
  mypdf();

  return (
    <>
      <div className="w-[100%] h-[100%] flex flex-col items-center  overflow-scroll ">
        <Dashboard />
        <div className=" gap-2 h-[93%]  flex flex-col  items-center ">
          {" "}
          {canvas.current.map((canvasRef, index) => (
            <canvas key={index} ref={canvasRef} className="shadow-md  " />
          ))}
        </div>
      </div>
    </>
  );
}

const Dashboard = () => {
  return (
    <div className="w-[100%]   bg-zinc-100  h-[7%] ">
      <div className="w-full h-full"></div>
      <hr className="opacity-5" />
    </div>
  );
};
