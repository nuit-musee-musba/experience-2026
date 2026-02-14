import StatsJs from "stats.js";

export class Stats {
  constructor(body) {
    this.body = body;
    this.stats = new StatsJs();
    this.stats.showPanel(0);
    this.stats.dom.style.top = "0px";
    this.stats.dom.style.left = "0%";
    this.stats.dom.style.transformOrigin = "top right";
    this.body.appendChild(this.stats.dom);
  }

  begin() {
    this.stats.begin();
  }

  end() {
    this.stats.end();
  }
}
