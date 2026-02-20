import StatsJs from "stats.js";

export class Stats {
  constructor(body) {
    this.body = body;
    this.stats = new StatsJs();
    this.stats.showPanel(0);
    this.stats.dom.style.top = "0px";
    this.stats.dom.style.left = "0px";
    
    const children = this.stats.dom.children;
    for (let i = 0; i < children.length; i++) {
        children[i].style.display = 'block';
        children[i].style.pointerEvents = 'none';
    }

    this.body.appendChild(this.stats.dom);
  }

  begin() {
    this.stats.begin();
  }

  end() {
    this.stats.end();
  }
}
