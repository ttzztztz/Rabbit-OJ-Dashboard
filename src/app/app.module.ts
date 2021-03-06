import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSelectModule } from "@angular/material/select";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from "ngx-mat-datetime-picker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from "./app.component";
import { ListComponent } from "./list/list.component";
import { DetailComponent } from "./detail/detail.component";
import { LoginComponent } from "./user/login/login.component";
import { RegisterComponent } from "./user/register/register.component";

import { httpInterceptorProviders } from "./interceptor";
import { SubmissionComponent } from "./submission/submission.component";
import { SubmissionDetailComponent } from "./submission/submission-detail/submission-detail.component";
import { CaseDotComponent } from "./submission/case-dot/case-dot.component";
import { SubmissionListComponent } from "./submission/submission-list/submission-list.component";
import { ContestListComponent } from "./contest/contest-list/contest-list.component";
import { ContestDashboardComponent } from "./contest/contest-dashboard/contest-dashboard.component";
import { DescriptionComponent } from "./detail/description/description.component";
import { SubmitCodeComponent } from "./detail/submit-code/submit-code.component";

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    DetailComponent,
    LoginComponent,
    RegisterComponent,
    SubmissionComponent,
    SubmissionDetailComponent,
    CaseDotComponent,
    SubmissionListComponent,
    ContestListComponent,
    ContestDashboardComponent,
    DescriptionComponent,
    SubmitCodeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    MatChipsModule,
    MatCardModule,
    MatInputModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatMomentDateModule,
    MatBadgeModule,
    MarkdownModule.forRoot()
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule {}
