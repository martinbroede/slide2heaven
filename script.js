const lastVisited = parseInt(document.location.hash.split("-")[1]);
let currentPage = isNaN(lastVisited) ? 0 : lastVisited;
let pagesTotal = 0;

document.addEventListener("DOMContentLoaded", () => {
  addSources();
  preparePresentation();
});

document.body.addEventListener("keyup", function (event) {
  if (event.target.tagName != "BODY") return;

  const arrowFunction = {
    ",": () => currentPage--,
    ".": () => currentPage++,
  }[event.key];

  if (arrowFunction) {
    arrowFunction();
    scrollToCurrentPage();
  }
});

function preparePresentation() {
  convertDirectives();
  setTitle();
  wrapImages();
  wrapSections();
  addFooters();
}

function addFooters() {
  let sectionCounter = 0;
  const sections = Array.from(document.getElementsByTagName("section"));
  for (let section of sections) {
    section.insertAdjacentHTML("afterend", generateFooter(sectionCounter, pagesTotal));
    sectionCounter++;
  }
}

function generateFooter(sectionCounter, pagesTotal) {
  const pageNumber = sectionCounter > 0 ? sectionCounter + " / " + pagesTotal : "";
  const sDate = new Date(config.date).toLocaleDateString("de", { year: "2-digit", month: "short", day: "2-digit" });
  let templateHTML = "<footer> <hr/> %CUSTOM_IMG <p> %CUSTOM_FOOTER_TEXT </p> </footer>";
  templateHTML = templateHTML.replace("%CUSTOM_IMG", config.image);
  templateHTML = templateHTML.replace("%CUSTOM_FOOTER_TEXT", config.footer.replaceAll(" ", "&nbsp;"));
  templateHTML = templateHTML.replace("%PAGINATION", config.pagination);
  templateHTML = templateHTML.replace("%DATE", sDate);
  templateHTML = templateHTML.replaceAll("%PAGE_NUM", pageNumber);
  return templateHTML;
}

function addSources() {
  const head = document.getElementsByTagName("head")[0];
  const body = document.getElementsByTagName("body")[0];
  const outline = document.createElement("h1");
  const link = document.createElement("link");
  outline.innerText = "Outline";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "http://127.0.0.1:8080/style.css";
  body.prepend(outline);
  head.appendChild(link);
}

function setTitle() {
  document.getElementsByTagName("title")[0].innerHTML = config.title;
}

function checkDirectives(innerHTML) {
  const boxDirectives =
    innerHTML.split("%half").length - 1 + innerHTML.split("%third").length - 1 + innerHTML.split("%quarter").length - 1;
  const boxDelimiters = innerHTML.split("%end").length - 1;
  if (boxDelimiters != boxDirectives) {
    throw Error("syntax error regarding box directives");
  }
}

function convertDirectives() {
  let innerHTML = document.body.innerHTML;
  try {
    checkDirectives(innerHTML);
    console.log("directives checked");
    innerHTML = innerHTML
      .replaceAll("<p>%half</p>", "<div><block-2>")
      .replaceAll("<p>%nexthalf</p>", "</block-2><block-2>")
      .replaceAll("<p>%endhalf</p>", "</block-2></div>")

      .replaceAll("<p>%third</p>", "<div><block-3>")
      .replaceAll("<p>%nextthird</p>", "</block-3><block-3>")
      .replaceAll("<p>%endthird</p>", "</block-3></div>")

      .replaceAll("<p>%quarter</p>", "<div><block-4>")
      .replaceAll("<p>%nextquarter</p>", "</block-4><block-4>")
      .replaceAll("<p>%endquarter</p>", "</block-4></div>")

      .replaceAll("<p>%newpage</p>", "<new-page></new-page>");
  } catch (err) {
    console.error(err);
  }
  document.body.innerHTML = innerHTML;
}

function hideBoard() {
  document.getElementById("board").style.display = "none";
}

function scrollToCurrentPage() {
  currentPage = currentPage < 0 ? 0 : currentPage;
  currentPage = currentPage > pagesTotal ? pagesTotal : currentPage;
  if (currentPage >= 0) {
    location.href = "#page-" + currentPage;
  }
  document.getAnimations().forEach((animation) => {
    animation.cancel();
    animation.play();
  });
}

function wrapImages() {
  const images = document.getElementsByTagName("IMG");
  for (let img of images) {
    if (!["BLOCK-1", "BLOCK-2", "BLOCK-3", "BLOCK-4", "BLOCK-5"].includes(img.parentElement.tagName)) {
      continue;
    }
    if (img.parentElement.tagName == "P") {
      continue;
    }
    const wrapper = document.createElement("p");
    img.parentNode.insertBefore(wrapper, img);
    img.style.width = "100%";
    wrapper.appendChild(img);
  }
}

function wrapSections() {
  let section = null;
  let counter = 0;
  const sections = [];
  for (let childNode of Array.from(document.body.childNodes)) {
    if (childNode.tagName == "H1" || childNode.tagName == "NEW-PAGE") {
      section = document.createElement("section");
      section.style.height = config.sectionHeight;
      section.id = "page-" + counter;
      sections.push(section);
      counter++;
    }
    if (section) {
      section.append(childNode);
    }
  }
  for (const section of sections) document.body.append(section);
  pagesTotal = sections.length - 1;
}
