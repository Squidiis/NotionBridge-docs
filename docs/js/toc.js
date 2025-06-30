
export function setupTOCTracking() {
  const toc = document.getElementById("toc");
  const contentArea = document.getElementById("content");
  const OFFSET = 80;

  contentArea.addEventListener("scroll", () => {
    const headers = contentArea.querySelectorAll("h1, h2, h3");
    let currentId = null;

    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i].offsetTop - OFFSET - 10 <= contentArea.scrollTop) {
        currentId = headers[i].id;
        break;
      }
    }

    toc.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    if (currentId) {
      const link = toc.querySelector(`a[href="#${currentId}"]`);
      link?.parentElement.classList.add("active");
    }
  });
}
