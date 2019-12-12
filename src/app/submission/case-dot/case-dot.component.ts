import { Component, OnInit, Input } from "@angular/core";
import { IJudgeResult } from "src/app/interface/submission";
import { MemoryService } from "src/app/service/memory.service";

@Component({
  selector: "app-case-dot",
  templateUrl: "./case-dot.component.html",
  styleUrls: ["./case-dot.component.scss"]
})
export class CaseDotComponent implements OnInit {
  @Input() dot: IJudgeResult;
  @Input() key: number;

  renderMemoryUsed = () => MemoryService.displayMemory(this.dot.space_used);
  constructor() {}
  ngOnInit() {}
}
