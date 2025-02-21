// npm install pdfjs-dist --save-dev
//
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";
export default function PdfViewer() {
  // Some PDFs need external cmaps.
  //
  const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
  const CMAP_PACKED = true;

  const DEFAULT_URL = "../../web/compressed.tracemonkey-pldi-09.pdf";
  const PAGE_TO_VIEW = 1;
  const SCALE = 1.0;

  const ENABLE_XFA = true;
  // Will be using promises to load document, pages and misc data instead of
  const loadingTask = pdfjsLib.getDocument({
    url: DEFAULT_URL,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    enableXfa: ENABLE_XFA,
  });
  return (
    <div>
      <h1>pdf viewer</h1>
    </div>
  );
}
