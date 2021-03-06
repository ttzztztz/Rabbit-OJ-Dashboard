import { Component, OnInit, Input } from "@angular/core";
import { JudgeResult } from "src/app/interface/submission";
import { HelperService } from 'src/app/service/helper.service';

@Component({
  selector: "app-case-dot",
  templateUrl: "./case-dot.component.html",
  styleUrls: ["./case-dot.component.scss"]
})
export class CaseDotComponent implements OnInit {
  @Input() dotList: Array<JudgeResult>;

  renderMemoryUsed = (dot : JudgeResult) => HelperService.displayMemory(dot.space_used);
  constructor() {}
  ngOnInit() {}
}
