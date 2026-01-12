import StatsJs from "stats.js";

export class Stats {
  constructor(body) {
    this.body = body;
    this.stats = new StatsJs();
    this.stats.showPanel(0);
    // this.stats.dom.style.transform = `scale(${100 / window.innerWidth * 40})`;
    // this.stats.dom.style.transformOrigin = "top left";
    this.body.appendChild(this.stats.dom);
  }

  begin() {
    this.stats.begin();
  }

  end() {
    this.stats.end();
  }
}
