"""PDF text extraction module with OCR support."""
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Extract text from PDFs with fallback to OCR for scanned documents."""

    def __init__(self, use_ocr: bool = True):
        """
        Initialize PDF extractor.

        Args:
            use_ocr: Enable OCR for scanned PDFs
        """
        self.use_ocr = use_ocr

    def extract_text(self, pdf_path: str) -> Dict[str, any]:
        """
        Extract text from a PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with extracted text, metadata, and page count
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        try:
            doc = fitz.open(pdf_path)
            pages_text = []
            total_text = ""

            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()

                # If text extraction yields very little, try OCR
                if self.use_ocr and len(text.strip()) < 50:
                    logger.info(f"Low text content on page {page_num + 1}, attempting OCR...")
                    text = self._ocr_page(page)

                pages_text.append({
                    "page_number": page_num + 1,
                    "text": text
                })
                total_text += f"\n\n--- Page {page_num + 1} ---\n\n{text}"

            metadata = self._extract_metadata(doc)
            doc.close()

            return {
                "success": True,
                "total_text": total_text,
                "pages": pages_text,
                "page_count": len(doc),
                "metadata": metadata,
                "file_path": pdf_path
            }

        except Exception as e:
            logger.error(f"Error extracting PDF {pdf_path}: {e}")
            return {
                "success": False,
                "error": str(e),
                "file_path": pdf_path
            }

    def _ocr_page(self, page) -> str:
        """
        Perform OCR on a PDF page.

        Args:
            page: PyMuPDF page object

        Returns:
            Extracted text from OCR
        """
        try:
            # Render page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
            img_data = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_data))

            # Perform OCR
            text = pytesseract.image_to_string(image, lang='eng')
            return text

        except Exception as e:
            logger.error(f"OCR failed: {e}")
            return ""

    def _extract_metadata(self, doc) -> Dict[str, str]:
        """
        Extract metadata from PDF document.

        Args:
            doc: PyMuPDF document object

        Returns:
            Dictionary of metadata
        """
        metadata = doc.metadata
        return {
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
            "keywords": metadata.get("keywords", ""),
            "creator": metadata.get("creator", ""),
            "producer": metadata.get("producer", ""),
            "creation_date": metadata.get("creationDate", ""),
            "mod_date": metadata.get("modDate", "")
        }

    def extract_from_directory(self, directory: str, pattern: str = "*.pdf") -> List[Dict]:
        """
        Extract text from all PDFs in a directory.

        Args:
            directory: Directory path
            pattern: File pattern (default: *.pdf)

        Returns:
            List of extraction results
        """
        import glob

        pdf_files = glob.glob(os.path.join(directory, pattern))
        results = []

        for pdf_file in pdf_files:
            logger.info(f"Processing: {pdf_file}")
            result = self.extract_text(pdf_file)
            results.append(result)

        return results


if __name__ == "__main__":
    # Test the extractor
    logging.basicConfig(level=logging.INFO)
    extractor = PDFExtractor(use_ocr=True)

    # Example usage
    # result = extractor.extract_text("path/to/your/pdf/file.pdf")
    # print(result["total_text"][:500])
