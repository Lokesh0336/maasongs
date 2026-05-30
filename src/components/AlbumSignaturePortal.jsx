// src/components/AlbumSignaturePortal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portal overlay that positions an image absolutely on the page
 * over a target element (targetRef).
 *
 * Props:
 *  - targetRef: ref to the element (album-cover) to overlay
 *  - src: signature image url (e.g. "/signature.png")
 *  - scale: fraction of target width (0.25 = 25%)
 *  - padding: px padding from edges
 */
export default function AlbumSignaturePortal({ targetRef, src, scale = 0.28, padding = 12, opacity = 0.95 }) {
  const [rect, setRect] = useState(null);
  const imgRef = useRef(null);

  // compute position whenever target changes, or on scroll/resize
  useEffect(() => {
    if (!targetRef?.current) return;

    const compute = () => {
      const el = targetRef.current;
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      // include page scroll offset to convert to document coordinates
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      setRect({
        left: Math.round(r.left + scrollX),
        top: Math.round(r.top + scrollY),
        width: Math.round(r.width),
        height: Math.round(r.height),
      });
    };

    compute();
    const debounced = () => {
      // re-calc after small delay
      compute();
    };
    window.addEventListener("resize", debounced);
    window.addEventListener("scroll", debounced, true);
    // mutation observer in case layout changes
    const mo = new MutationObserver(debounced);
    mo.observe(document.body, { attributes: true, subtree: true, childList: true });

    return () => {
      window.removeEventListener("resize", debounced);
      window.removeEventListener("scroll", debounced, true);
      mo.disconnect();
    };
  }, [targetRef]);

  if (!rect) return null;

  // compute signature size and position (bottom-right)
  const sigWidth = Math.round(rect.width * scale);
  // style for the portal image
  const style = {
    position: "absolute",
    left: `${rect.left + rect.width - sigWidth - padding}px`,
    top: `${rect.top + rect.height - Math.round(sigWidth * 0.45) - padding}px`, // approximated height
    width: `${sigWidth}px`,
    // height will auto maintain aspect
    pointerEvents: "none",
    opacity,
    zIndex: 9999999,
    transform: "translateZ(0)",
    userSelect: "none",
    WebkitUserDrag: "none",
  };

  return createPortal(
    <img ref={imgRef} src={src} alt="signature" style={style} draggable={false} />,
    document.body
  );
}
