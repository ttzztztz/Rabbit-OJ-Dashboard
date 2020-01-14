import { Component, OnInit } from "@angular/core";
import { Contest } from "src/app/interface/contest";
import { ContestClarify } from "src/app/interface/contest-clarify";
import { ContestMyInfo } from "src/app/interface/contest-my-info";
import { MatPaginator } from "@angular/material/paginator";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap, map, takeUntil } from "rxjs/operators";
import { GeneralResponse } from "src/app/interface/general-response";
import { UrlService } from "src/app/service/url.service";
import { ScoreBoard, ScoreBoardResponse } from "src/app/interface/score-board";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HelperService } from "src/app/service/helper.service";
import { ContestQuestion, ContestQuestionItem } from "src/app/interface/contest-question";
import { ContestSubmission, Submission } from "src/app/interface/submission";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { AuthenticationService } from "src/app/service/authentication.service";
import { WebSocketSubject } from "rxjs/webSocket";
import { WebsocketMessage } from "src/app/interface/websocket";
import { interval, Subject, timer } from "rxjs";

@Component({
  selector: "app-contest-dashboard",
  templateUrl: "./contest-dashboard.component.html",
  styleUrls: ["./contest-dashboard.component.scss"]
})
export class ContestDashboardComponent implements OnInit {
  contest: Contest<string> = {
    name: "Loading...",
    start_time: new Date().toLocaleString(),
    block_time: new Date().toLocaleString(),
    end_time: new Date().toLocaleString(),
    status: 1,
    participants: 0,
    penalty: 300,
    count: 5,
    cid: 0,
    uid: 0
  };
  scoreBoardList: Array<ScoreBoard> = [];
  scoreBoardDisplayedColumns: string[] = ["username", "score"];
  scoreBoardExtraColumns: string[] = [];
  scoreBoardCount: number = 0;
  scoreBoardBlocked: boolean = false;
  refreshTime = {
    scoreBoard: new Date(),
    question: new Date(),
    submission: new Date(),
    clarify: new Date(),
    info: new Date()
  };
  clarifyList: Array<ContestClarify<string>> = [];
  clarifyRead: number = 0;
  myInfo: ContestMyInfo = {
    score: 0,
    rank: 0,
    total_time: 0,
    progress: [],
    registered: false
  };
  scoreBoardPage: number = 1;
  contestQuestions: Array<ContestQuestion> = [];
  submissionList: Array<ContestSubmission> = [];
  questionMap: Map<number, ContestQuestionItem> = new Map<number, ContestQuestionItem>();
  submissionInfo: Map<string, Submission> = new Map<string, Submission>();
  socketStatus: boolean = true;
  remainTime: string = "";
  private unsubscribe$: Subject<void>;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public authService: AuthenticationService
  ) {}

  renderTime = (input: number): string => HelperService.displayRelativeTime(input);
  renderRemainTime = () => {
    const now = new Date();
    const endContest = new Date(this.contest.end_time);
    this.remainTime = HelperService.displayRelativeTime(((endContest.getTime() - now.getTime()) / 1000) | 0);
  };
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit() {
    this.unsubscribe$ = new Subject<void>();
    setTimeout(() => {
      this.route.paramMap
        .pipe(
          switchMap((params: ParamMap) =>
            this.http
              .get<GeneralResponse<Contest>>(UrlService.CONTEST.GET_INFO(params.get("cid")))
              .pipe(map(item => item.message))
          )
        )
        .subscribe(response => {
          this.contest = {
            ...response,
            start_time: new Date(response.start_time).toLocaleString(),
            end_time: new Date(response.end_time).toLocaleString(),
            block_time: new Date(response.block_time).toLocaleString()
          };

          interval(500)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.renderRemainTime());

          if (this.contest.status > 0) {
            this.fetchMyInfo();
            this.fetchScoreBoard();
            this.fetchClarifyList();
            this.fetchQuestions();
            this.fetchSubmissionList();
          }

          if (this.contest.status === 1) {
            this.connectContestSocket();
            this.scheduledFetchScoreboard();
          }

          this.renderScoreBoardQuestions(response.count);
          this.scoreBoardCount = response.participants;
        });
    }, 0);
  }
  scheduledFetchScoreboard = () => {
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (this.socketStatus) {
          this.fetchScoreBoard();
        }
      });
  };
  fetchSubmissionList = (notice: boolean = false) => {
    this.http
      .get<GeneralResponse<Array<ContestSubmission>>>(
        UrlService.CONTEST.GET_SUBMISSION_LIST(this.route.snapshot.paramMap.get("cid"))
      )
      .pipe(map(item => item.message))
      .subscribe(response => {
        this.submissionList = response;

        this.refreshTime.submission = new Date();
        if (notice) {
          this.snackBar.open("提交列表已更新！", "OK", {
            duration: 2000
          });
        }
      });
  };
  fetchMyInfo = (notice: boolean = false) => {
    this.http
      .get<GeneralResponse<ContestMyInfo>>(UrlService.CONTEST.GET_MY_INFO(this.route.snapshot.paramMap.get("cid")))
      .pipe(map(item => item.message))
      .subscribe(response => {
        this.myInfo = response;

        this.refreshTime.info = new Date();
        if (notice) {
          this.snackBar.open("比赛信息已更新！", "OK", {
            duration: 2000
          });
        }
      });
  };
  fetchClarifyList = (notice: boolean = false) => {
    this.http
      .get<GeneralResponse<Array<ContestClarify<Date>>>>(
        UrlService.CONTEST.GET_CLARIFY(this.route.snapshot.paramMap.get("cid"))
      )
      .pipe(map(item => item.message))
      .subscribe(response => {
        this.clarifyList = response.map(item => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleString()
        }));

        this.refreshTime.clarify = new Date();
        if (notice) {
          this.snackBar.open("比赛信息板已更新！", "OK", {
            duration: 2000
          });
        }
      });
  };
  fetchScoreBoard = (notice: boolean = false) => {
    this.http
      .get<GeneralResponse<ScoreBoardResponse>>(
        UrlService.CONTEST.GET_SCORE_BOARD(this.route.snapshot.paramMap.get("cid"), this.scoreBoardPage.toString())
      )
      .pipe(map(item => item.message))
      .subscribe(response => {
        this.scoreBoardList = response.list;
        this.scoreBoardBlocked = response.blocked;
        this.contest = {
          ...this.contest,
          participants: response.count
        };
        this.refreshTime.scoreBoard = new Date();
        if (notice) {
          this.snackBar.open("排行榜已更新！", "OK", {
            duration: 2000
          });
        }
      });
  };
  fetchQuestions = (notice: boolean = false) => {
    this.http
      .get<GeneralResponse<Array<ContestQuestion>>>(
        UrlService.CONTEST.GET_QUESTIONS(this.route.snapshot.paramMap.get("cid"))
      )
      .pipe(map(item => item.message))
      .subscribe(response => {
        this.contestQuestions = response;
        this.questionMap.clear();

        this.contestQuestions.forEach(item => {
          this.questionMap.set(item.tid, { id: item.id, subject: item.subject });
        });

        this.refreshTime.question = new Date();
        if (notice) {
          this.snackBar.open("题目已更新！", "OK", {
            duration: 2000
          });
        }
      });
  };
  renderScoreBoardQuestions = (count: number) => {
    const basicArr = ["username", "score"];
    const extraArr = [];
    for (let i = 1; i <= count; i++) {
      basicArr.push(`T${i}`);
      extraArr.push(`T${i}`);
    }
    this.scoreBoardDisplayedColumns = basicArr;
    this.scoreBoardExtraColumns = extraArr;
  };
  handleRegister = (status: "reg" | "cancel") => {
    this.http
      .post<GeneralResponse<string>>(
        UrlService.CONTEST.POST_REGISTER(this.route.snapshot.paramMap.get("cid"), status),
        {}
      )
      .subscribe(response => {
        if (response.code === 200) {
          this.snackBar.open("操作成功！", "OK", {
            duration: 2000
          });
        } else {
          this.snackBar.open(response.message, "OK", {
            duration: 2000
          });
        }

        this.fetchMyInfo();
      });
  };
  handlePageChange = (paginator: MatPaginator) => {
    this.scoreBoardPage = paginator.pageIndex + 1;
    this.fetchScoreBoard();
  };
  handleOpenSubmissionPanel = (sid: string) => {
    if (!this.submissionInfo.has(sid) || this.submissionInfo.get(sid).status === "ING") {
      this.route.paramMap
        .pipe(
          switchMap(() =>
            this.http
              .get<GeneralResponse<Submission>>(UrlService.SUBMISSION.GET_DETAIL(sid))
              .pipe(map(item => item.message))
          )
        )
        .subscribe(response => {
          this.submissionInfo.set(sid, response);
        });
    }
  };
  handleSubmit = (tid: string) => ({ language, code }: { language: string; code: string }) => {
    if (language === "") {
      this.snackBar.open("Select a language first!", "OK", {
        duration: 2000
      });

      return;
    }

    this.http
      .post<GeneralResponse<number>>(UrlService.CONTEST.POST_SUBMIT(this.contest.cid.toString(), tid), {
        language: language,
        code: code
      })
      .subscribe(({ code, message }) => {
        if (code === 200) {
          this.socketContestSubmissionInfo(message);
          this.submissionList.unshift({
            sid: message,
            cid: this.contest.cid,
            uid: this.authService.currentUser.uid,
            tid: Number.parseInt(tid),
            status: 0,
            total_time: ((new Date().getTime() - new Date(this.contest.start_time).getTime()) / 1000) | 0,
            created_at: new Date().toLocaleString()
          });
          this.snackBar.open("代码提交成功！", "OK", {
            duration: 2000
          });
        }
      });
  };
  handleSelectedTabChange = (e: MatTabChangeEvent) => {
    if (e.index === 3) {
      this.clarifyRead = this.clarifyList.length;
    }
  };
  renderBlockedScoreboard = () => {
    if (this.scoreBoardBlocked) {
      return ", 已封榜";
    } else {
      return "";
    }
  };
  connectContestSocket = () => {
    const socket$ = new WebSocketSubject<WebsocketMessage>(
      UrlService.CONTEST.SOCKET(this.contest.cid.toString(), this.authService.currentUser.uid.toString())
    );

    this.socketStatus = true;
    socket$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      ({ type, message }) => {
        if (type === "clarify") {
          this.snackBar.open(message, "OK", {
            duration: 2000
          });
          this.clarifyList.push({
            cid: this.contest.cid,
            created_at: new Date().toLocaleString(),
            message: message
          });
        }
      },
      err => {
        console.error(err);
        this.snackBar.open("WebSocket配信中断，10秒后将会自动重连！", "OK", {
          duration: 2000
        });
        this.socketStatus = false;

        timer(10000)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => this.connectContestSocket());
      }
    );
  };
  socketContestSubmissionInfo = (sid: number) => {
    const socket$ = new WebSocketSubject<{ ok: number }>(UrlService.SUBMISSION.SOCKET(sid.toString()));
    socket$.subscribe(
      ({ ok }) => {
        if (ok) {
          this.http
            .get<GeneralResponse<ContestSubmission>>(
              UrlService.CONTEST.GET_SUBMISSION_ONE(this.contest.cid.toString(), sid.toString())
            )
            .pipe(map(item => item.message))
            .subscribe(response => {
              this.fetchMyInfo();

              this.submissionList.forEach(item => {
                if (item.sid === sid) {
                  item.status = response.status;
                }
              });
            });
        }
      },
      err => {
        console.error(err);
        this.snackBar.open("WebSocket已断开，可能无法实时更新评测结果！", "OK");
      }
    );
  };
}
