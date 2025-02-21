// npm install pdfjs-dist --save-dev
//
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, use } from "react";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

async function loadPdf(url) {
  const pdf = pdfjsLib.getDocument(url);
  const PDF = await pdf.promise;
  return PDF;
}

export default function PdfViewer() {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPage, setTotalPage] = useState(null);
  const [pdfPage, setPdfPage] = useState(null);
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");
  const [pageNumber, setPageNumber] = useState(null);
  const [scale, setScale] = useState(1);
  // point to canvas for display PDF

  async function LOAD_PDF(url) {
    if (!url) return;
    const _pdf = await loadPdf(url);
    setPdfDoc(_pdf);
    setPageNumber(1);
  }
  async function LOAD_PAGE(n) {
    if (!pdfDoc || !pageNumber) return;
    const _page = await pdfDoc.getPage(n);
    setPdfPage(_page);
  }

  async function RENDER_PAGE(scale) {
    if (!pdfPage) return;
    const viewport = pdfPage.getViewport({ scale: scale });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    pdfPage.render(renderContext);
  }
  useEffect(() => {
    try {
      LOAD_PDF(url);
    } catch (error) {
      console.log("error loading PDF DOC : " + error);
    }
  }, [url]);

  useEffect(() => {
    try {
      LOAD_PAGE(pageNumber);
      RENDER_PAGE(scale);
    } catch (error) {
      console.log("error loading Page : " + error);
    }
  }, [pageNumber]);
  useEffect(() => {
    try {
      RENDER_PAGE(scale);
    } catch (error) {
      console.log("error render Page : " + error);
    }
  }, [scale]);

  return (
    <div className="h-full w-full  flex flex-col justify-center items-center overflow-scroll">
      <div>
        <h1 className="text-2xl  ">pdf viewer</h1>
        <button
          onClick={() =>
            setUrl("/Learning the bash Shell, 3rd Edition (3).pdf")
          }
          className="cursor-pointer active:bg-red-400 p-2 outline-1 hover:bg-amber-400"
        >
          change page
        </button>

        <button
          onClick={() => setPageNumber((pageNumber) => pageNumber + 1)}
          className="cursor-pointer active:bg-red-400 p-2 outline-1 hover:bg-amber-400"
        >
          get page
        </button>
        <button
          onClick={() => setScale((scale) => scale + 0.2)}
          className="cursor-pointer active:bg-red-400 p-2 outline-1 hover:bg-amber-400"
        >
          +
        </button>
        <button
          onClick={() => setScale((scale) => scale - 0.2)}
          className="cursor-pointer active:bg-red-400 p-2 outline-1 hover:bg-amber-400"
        >
          -
        </button>
      </div>
      <canvas ref={canvasRef} id="canvas-pdf" className="shadow-md"></canvas>
    </div>
  );
}
