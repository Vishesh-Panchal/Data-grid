import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { CaseApiUrl, ControleRenderType, UserType } from '../../models/enums/case.enums';
import formurlencoded from 'form-urlencoded';
import { ToastrService } from 'ngx-toastr';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent, DxFormComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { Console } from 'console';



@Component({
  selector: 'app-due-diligence',
  templateUrl: './due-diligence.component.html',
  styleUrls: ['./due-diligence.component.scss']
})
export class DueDiligenceComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('dynamicForm') dynamicForm: DxFormComponent;
  @ViewChild('questionListGrid1', { static: false }) questionListGrid1: DxDataGridComponent
  @ViewChild('questionListGrid2', { static: false }) questionListGrid2: DxDataGridComponent
  @ViewChild('icnmsGrid', { static: false }) icnmsGrid: DxDataGridComponent
  @ViewChild('SWyourGridA', { static: false }) SWyourGridA: DxDataGridComponent;
  @ViewChild('OTyourGridA', { static: false }) OTyourGridA: DxDataGridComponent;
  @ViewChild('SWotherGridB', { static: false }) SWotherGridB: DxDataGridComponent;
  @ViewChild('OTotherGridB', { static: false }) OTotherGridB: DxDataGridComponent;
  @ViewChild('FormControlsAnswers1', { static: false }) FormControlsAnswers1: DxFormComponent
  @ViewChild('commentForm') commentForm: DxFormComponent;
  @ViewChild('commentFormIvsP') commentFormIvsP: DxFormComponent;
  @ViewChild('commentFormSWOT') commentFormSWOT: DxFormComponent;
  @ViewChild('commentFormICNMs') commentFormICNMs: DxFormComponent;
  @ViewChild('commentFormAlternative') commentFormAlternative: DxFormComponent;
  @ViewChild('stepper') myStepper: MatStepper;
  @Input() selectedIndex: number;
  @Output() OnPrevButtonClick: EventEmitter<any> = new EventEmitter();
  CaseId: number;
  PartyId: number;
  dueDiligenceAdminShare: boolean = false;
  EnableApproveButton = false;
  labelDetail: any;
  ApplicationFormData = {};
  ADRDataObj = {};
  ControlConfig = {};
  questionDataList1: any = {};
  questionDataList2: any = {};
  icnmsGridDataList: any = {};
  SWyourGridDataListA: any = {};
  OTyourGridDataListA: any = {};
  SWotherGridDataListB: any = {};
  OTotherGridDataListB: any = {};
  AlternativeFormAnswers: {};
  SWOTGridAnswers1: {};
  SWOTGridAnswers2: {};
  SWOTGridAnswers3: {};
  SWOTGridAnswers4: {};

  exerciseInrestId: number;
  exerciseICNMSId: number;
  exerciseAlternativeId: number;
  exerciseSWOTId: number;
  totalADR: number = 0;
  sectionName: string;
  FormControlsAnswers;
  ControlType = ControleRenderType;
  IntrestVsPosition: string;
  ICNMs: string;
  ALTERNATIVES: string;
  SWOT: string;
  ExerciseId: number;
  ExerciseName: string;

  ExerciseUsersAnsewerGrid1: [] = [];
  ExerciseUsersAnsewerGrid2: [] = [];
  ExerciseUsersAnsewerGrid3: [] = [];
  ExerciseUsers: [] = [];
  AlrernativeAnswer: [] = [];
  Exercise: [] = [];
  exerciseAnswers = [];

  editApplicationFormPermission: boolean = false;
  CurrentDisputantApproveButtonsubscription: Subscription;
  CurrentDueFormsubscription: Subscription;

  caseStatusDetail: any;
  approveStatus: boolean = false;
  statusSectionName: string;
  ViewAccesPopupVisible: boolean = false;
  errorMessageForApprove: string = "";
  dueDeligenceAdminSharereturn: any;
  requiredField: boolean;
  radioOption: any[];
  commentTextADR: string = "";
  commentTextIvsP: string = "";
  commentTextICNMs: string = "";
  commentTestALTERNATIVE: string = "";
  commentTextSWOT: string = "";
  commentModule: string = "Due Diligence";
  frmFetchCaseStatusDetail: {
    caseId: number,
    partyId: number
  }
  ButtonOptions: any = {
    text: "Save & Next",
    type: "default",
    useSubmitBehavior: true
  }

  constructor(private caseService: CaseService, private toasterService: ToastrService, private route: ActivatedRoute) {
    this.route.params.subscribe(p => {
      this.CaseId = p['caseId'];
      this.PartyId = p['partyId'];
    });
  }

  ngOnInit() {
    this.radioOption = [
      "Yes",
      "No"
    ];
    this.handleRouteParams();
    this.fetchDDQuestionnaires();
    this.CurrentDisputantApproveButtonsubscription = this.caseService.CurrentDisputantApproveButtonStatus.subscribe(res => {
      if (res != null) {
        this.EnableApproveButton = res;
        // this.IsUserTypeAR = true;
      }
    });
    this.CurrentDueFormsubscription = this.caseService.CurrentApplicationFormData.subscribe(data => {
      if (data != null) {
        this.ApplicationFormData = data;
        this.editApplicationFormPermission = this.ApplicationFormData['editApplicationFormPermission'];
        if (data.CurrentRole == UserType.AR) {
          this.requiredField = true;
        }
        else {
          this.requiredField = false;
        }
      }
    });
  }

  fetchDDQuestionnaires() {
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    let encodedBody = formurlencoded(body);
    this.caseService.commonPostApiCall(CaseApiUrl.FETCH_CASE_DD_QUESTIONNAIRES, encodedBody, true, false).subscribe(data => {
      if (data['success']) {
        //this.toasterService.success(data['errorMsg'], 'Success');
        //  this.GetRiskinGridQuadrant();
        this.ApplicationFormData = data.data;
        this.Exercise = data?.data?.exercises;
        this.labelDetail = new Map();
        for (let i = 0; i < data?.data?.exercises.length; i++) {
          this.ExerciseId = data?.data?.exercises[i]?.exerciseId;
          if (this.ExerciseId == 1) {
            this.exerciseInrestId = this.ExerciseId;
            this.IntrestVsPosition = data?.data?.exercises[i]?.exerciseName;
            this.commentTextIvsP = data?.data?.exercises[0]?.commentText;
          }
          if (this.ExerciseId == 2) {
            this.exerciseICNMSId = this.ExerciseId;
            this.ICNMs = data?.data?.exercises[i]?.exerciseName;
            this.commentTextICNMs = data?.data?.exercises[1]?.commentText;
          }
          if (this.ExerciseId == 3) {
            this.exerciseAlternativeId = this.ExerciseId;
            this.ALTERNATIVES = data?.data?.exercises[i]?.exerciseName;
            this.commentTestALTERNATIVE = data?.data?.exercises[2]?.commentText
          }
          if (this.ExerciseId == 4) {
            this.exerciseSWOTId = this.ExerciseId;
            this.SWOT = data?.data?.exercises[i]?.exerciseName;
            this.commentTextSWOT = data?.data?.exercises[3]?.commentText;
          }
          for (let j = 0; j < data?.data?.exercises[i]?.labels.length; j++) {
            if (data?.data?.exercises[i]?.labels[j]?.id != 'undifined') {
              this.labelDetail.set(data?.data?.exercises[i]?.labels[j]?.id, data?.data?.exercises?.[i]?.labels[j]?.lableName);
            }
          }
        }
        this.ExerciseUsersAnsewerGrid1 = data?.data?.exercises?.[0]?.users?.[0]?.questionAnswers?.[0].answers;
        this.ExerciseUsersAnsewerGrid2 = data?.data?.exercises?.[0]?.users?.[0]?.questionAnswers?.[1].answers;
        this.ExerciseUsersAnsewerGrid3 = data?.data?.exercises?.[1]?.users?.[0]?.questionAnswers?.[0].answers;
        this.AlternativeFormAnswers = data?.data?.exercises?.[2].users?.[0]?.questionAnswers?.[0].answers[0];
        this.SWOTGridAnswers1 = data?.data?.exercises?.[3].users?.[0]?.questionAnswers?.[0].answers;
        this.SWOTGridAnswers2 = data?.data?.exercises?.[3].users?.[0]?.questionAnswers?.[1].answers;
        this.SWOTGridAnswers3 = data?.data?.exercises?.[3].users?.[0]?.questionAnswers?.[2].answers;
        this.SWOTGridAnswers4 = data?.data?.exercises?.[3].users?.[0]?.questionAnswers?.[3].answers;
        if (!this.ExerciseUsersAnsewerGrid1) {
          this.ExerciseUsersAnsewerGrid1 = [];
        }
        if (!this.ExerciseUsersAnsewerGrid2) {
          this.ExerciseUsersAnsewerGrid2 = [];
        }
        if (!this.ExerciseUsersAnsewerGrid3) {
          this.ExerciseUsersAnsewerGrid3 = [];
        }
        if (!this.AlternativeFormAnswers) {
          this.AlternativeFormAnswers = {};
        }
        if (!this.SWOTGridAnswers1) {
          this.SWOTGridAnswers1 = {};
        }
        if (!this.SWOTGridAnswers2) {
          this.SWOTGridAnswers2 = {};
        }
        if (!this.SWOTGridAnswers3) {
          this.SWOTGridAnswers3 = {};
        }
        if (!this.SWOTGridAnswers4) {
          this.SWOTGridAnswers4 = {};
        }
        this.editApplicationFormPermission = data?.data?.editApplicationFormPermission;
        this.commentTextADR = data?.data?.questionnaires[0]?.commentText;
        this.ADRDataObj = data?.data?.questionnaires?.find(x => x.questionnaireGroupName === "ADR SCORE");
        if (this.ADRDataObj) {
          for (let i = 0; i < this.ADRDataObj['sections'].length; i++) {
            const section = this.ADRDataObj['sections'][i];
            this.sectionName = this.ADRDataObj['sections'][i].sectionName;
            for (let j = 0; j < section['questions'].length; j++) {
              const question = section['questions'][j];
              let possibleAns = question['answers']?.possibleAnswers;
              let questionType = question?.questionType;
              let currentQuestionId = question?.questionId;
              let innerObj = {};
              switch (questionType) {
                case "DropDown": {
                  innerObj['dataSource'] = possibleAns;//section?.questions.find(x => x.questionId == currentQuestionId)?.answers?.possibleAnswers;
                  innerObj['valueExpr'] = 'id';
                  innerObj['displayExpr'] = 'name';
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  break;
                }
                case "RadioWithTextBox": {
                  innerObj['dataSource'] = possibleAns; //section?.questions.find(x => x.questionId == currentQuestionId)?.answers?.possibleAnswers;
                  innerObj['valueExpr'] = 'id';
                  innerObj['displayExpr'] = 'name';
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  let no = {};
                  no['value'] = this.setAnswers(section['users'], "RadioWithTextSupportText", currentQuestionId);
                  this.ControlConfig[currentQuestionId + 'RS'] = no;
                  break;
                }
                case "TextBox": {
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  break;
                }
                case "Radio": {
                  innerObj['dataSource'] = possibleAns; //section?.questions.find(x => x.questionId == currentQuestionId)?.answers?.possibleAnswers;
                  innerObj['valueExpr'] = 'id';
                  innerObj['displayExpr'] = 'name';
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  break;
                }
                case "Chips": {
                  innerObj['dataSource'] = possibleAns;// section?.questions.find(x => x.questionId == currentQuestionId)?.answers?.possibleAnswers;
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  break;
                }
                case "VerticalRadio": {
                  innerObj['dataSource'] = possibleAns;// section?.questions.find(x => x.questionId == currentQuestionId)?.answers?.possibleAnswers;
                  innerObj['valueExpr'] = 'id';
                  innerObj['displayExpr'] = 'Mname';
                  innerObj['value'] = this.setAnswers(section['users'], questionType, currentQuestionId);
                  break;
                }
                default: {
                }
              }

              this.ControlConfig[currentQuestionId] = innerObj;
            }
          }
        }
      }
      else {
        // this.toasterService.error(data['errorMsg'], 'Error');
      }
    });
  }

  setAnswers(UserWiseAns, questionType, currentQuestionId) {
    let loggedinUserId = JSON.parse(localStorage.getItem('LoginUserId'));
    let user = UserWiseAns.find(x => x.userId == loggedinUserId);
    if (user) {
      let ans: any = null;
      switch (questionType) {
        case "DropDown": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerId;
          break;
        }
        case "RadioWithTextBox": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerId;
          break;
        }
        case "TextBox": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerText;
          break;
        }
        case "Radio": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerId;
          break;
        }
        case "Chips": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.yourChoices;
          break;

        }
        case "VerticalRadio": {
          ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerId;
          break;
        }
        case "RadioWithTextSupportText":
          {
            ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.answerText;
            break;
          }
        case "LikelyAnsDropDown":
          {
            ans = user['questionAnswers'].find(x => x.questionId == currentQuestionId)?.answers?.likelyPartnerAnswerId;
            break;
          }
        default: {
        }
      }
      return ans;
    }
  }

  onSubmit(e) {
    this.FormControlsAnswers;
    if (this.dynamicForm.instance.validate().isValid) {
      let body = {};
      body['caseId'] = this.CaseId;
      body['partyId'] = this.PartyId;
      body['questionnaireId'] = this.ADRDataObj['questionnaireId'];
      body['questionnaireGroupId'] = this.ADRDataObj['questionnaireGroupId'];
      body['commentText'] = this.commentTextADR;
      body['commentModule'] = this.commentModule;
      let sectionWiseQAArr = [];
      // let ADRScore = 0;
      this.totalADR = 0;
      for (let i = 0; i < this.ADRDataObj['sections'].length; i++) {
        const section = this.ADRDataObj['sections'][i];
        let innerObj = {};
        innerObj['sectionId'] = section.sectionId;

        let questionAnswerArr = [];
        let sectionScore = 0;

        for (var j = 0; j < section.questions.length; j++) {
          const question = section.questions[j];

          let scoreValue = Number.parseInt(question.answers.possibleAnswers.find(x => x.id == this.FormControlsAnswers[section.sectionId]?.[question.questionId])?.value);
          if (isNaN(scoreValue)) {
            scoreValue = 0;
            sectionScore = sectionScore + scoreValue;
          }
          else {
            sectionScore = sectionScore + scoreValue;
          }
          let QObj = {};
          // let defaultScore = sectionScore;
          QObj['questionId'] = question.questionId;

          let ansObj = {};
          switch (question.questionType) {

            case "DropDown": {
              ansObj['answerId'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              // ansObj['likelyPartnerAnswerId'] = this.FormControlsAnswers['likelyPartnerAnswerId'][section.sectionId][question.questionId];
              break;
            }
            case "RadioWithTextBox": {
              ansObj['answerId'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              ansObj['answerText'] = this.FormControlsAnswers['RS' + section.sectionId]?.[question.questionId];
              break;
            }
            case "TextBox": {
              ansObj['answerText'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              break;
            }
            case "Radio": {
              ansObj['answerId'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              break;
            }
            case "Chips": {
              ansObj['yourChoices'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              break;
            }
            case "VerticalRadio": {
              ansObj['answerId'] = this.FormControlsAnswers[section.sectionId]?.[question.questionId];
              break;
            }
            default: {

            }
          }

          QObj['answers'] = ansObj;

          questionAnswerArr.push(QObj);

          innerObj['sectionScore'] = sectionScore;

          innerObj['questionAnswers'] = questionAnswerArr;
        }
        this.totalADR = this.totalADR + sectionScore;
        sectionWiseQAArr.push(innerObj);
      }
      body['adrScore'] = this.totalADR;
      body['sections'] = sectionWiseQAArr;

      this.caseService.commonPostApiCall(CaseApiUrl.ADD_UPDATE_DD_QUESTIONNAIRES, body, false).subscribe(res => {
        if (res['success']) {
          this.toasterService.success(res['errorMsg'], 'Success');
        }
        else {
          this.toasterService.error(res['errorMsg'], 'Error');
        }
      });
      this.myStepper.next();
    }
    else {
      this.toasterService.error("Please filled all requierd fields")
    }
  }
  //  =============================Intrest Vs Position Exercise start ==================================== //
  addOrUpdateExercise() {
    this.questionDataList1 = this.questionListGrid1.instance.getDataSource()['_items'];
    this.questionDataList2 = this.questionListGrid2.instance.getDataSource()['_items'];
    this.exerciseAnswers.push({ "labelId": 1, 'answers': this.questionDataList1 }, { "labelId": 2, 'answers': this.questionDataList2 });
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    body['exerciseId'] = this.exerciseInrestId;
    body['exerciseAnswers'] = this.exerciseAnswers;
    body['commentText'] = this.commentTextIvsP;
    body['commentModule'] = this.commentModule;
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_EXERCISE_ANSEWER, body, false).subscribe(data => {
      if (data['success']) {
        this.toasterService.success("Success", 'Success');
      }
      else {
        this.toasterService.error("Error", 'Error');
      }
    });
    this.myStepper.next();
  }
  //  =============================  END ==================================== //

  //  =============================ICNMS Exercise start ==================================== //
  addOrUpdateIcnmsExercise() {
    this.icnmsGridDataList = this.icnmsGrid.instance.getDataSource()['_items'];
    this.exerciseAnswers.push({ "labelId": 1, 'answers': this.icnmsGridDataList });
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    body['exerciseId'] = this.exerciseICNMSId;
    body['exerciseAnswers'] = this.exerciseAnswers;
    body['commentText'] = this.commentTextICNMs;
    body['commentModule'] = this.commentModule;
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_EXERCISE_ANSEWER, body, false).subscribe(data => {
      if (data['success']) {
        this.toasterService.success("Success", 'Success');
      }
      else {
        this.toasterService.error("Error", 'Error');
      }
    });
    this.myStepper.next();
  }
  //  =======================================END  ============================================ //
  //  =============================Alternative Exercise start ==================================== //
  addOrUpdateAlternative() {
    const formData = this.AlternativeFormAnswers;
    this.exerciseAnswers.push({ "labelId": 1, 'answers': [formData] });
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    body['exerciseId'] = this.exerciseAlternativeId;
    body['exerciseAnswers'] = this.exerciseAnswers;
    body['commentText'] = this.commentTestALTERNATIVE;
    body['commentModule'] = this.commentModule;
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_EXERCISE_ANSEWER, body, false).subscribe(data => {
      if (data['success']) {
        this.toasterService.success("Success", 'Success');
      }
      else {
        this.toasterService.error("Error", 'Error');
      }
    });
    this.myStepper.next();
  }
  //  =============================END ==================================== //
  //  =============================SWOT Exercise start ==================================== //
  addOrUpdateSWOT() {
    this.SWyourGridDataListA = this.SWyourGridA.instance.getDataSource()['_items'];
    this.OTyourGridDataListA = this.OTyourGridA.instance.getDataSource()['_items'];
    this.SWotherGridDataListB = this.SWotherGridB.instance.getDataSource()['_items'];
    this.OTotherGridDataListB = this.OTotherGridB.instance.getDataSource()['_items'];
    this.exerciseAnswers.push({ "labelId": 1, 'answers': this.SWyourGridDataListA }, { "labelId": 2, 'answers': this.OTyourGridDataListA }, { "labelId": 3, 'answers': this.SWotherGridDataListB }, { "labelId": 4, 'answers': this.OTotherGridDataListB });
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    body['exerciseId'] = this.exerciseSWOTId;
    body['exerciseAnswers'] = this.exerciseAnswers;
    body['commentText'] = this.commentTextSWOT;
    body['commentModule'] = this.commentModule;
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_EXERCISE_ANSEWER, body, false).subscribe(data => {
      if (data['success']) {
        this.toasterService.success("Success", 'Success');
      }
      else {
        this.toasterService.error("Error", 'Error');
      }
    });
    this.myStepper.next();
  }
  //  =============================END ==================================== //
  //  ============================= Result Subminting start ==================================== //
  shareDueDiligencePermition(e) {
    if (e.value == 'Yes') {
      this.dueDiligenceAdminShare = true;
    }
    else {
      this.dueDiligenceAdminShare = false
    }
  }
  onSubmitResult(e) {
    let innerBody = {};
    innerBody['caseId'] = this.CaseId;
    innerBody['partyId'] = this.PartyId;
    innerBody['dueDiligenceAdminShare'] = this.dueDiligenceAdminShare;
    let encodedBody = formurlencoded(innerBody);
    this.caseService.commonPostApiCall(CaseApiUrl.SUBMIT_DUE_DILIGENCE, encodedBody, true).subscribe(innerRes => {
      if (innerRes['success']) {
        this.toasterService.success(innerRes['errorMsg'], 'Successfully Finished Due-Diligence');
        let role = JSON.parse(localStorage.getItem('user-role'))?.name;

        if (this.ApplicationFormData['CurrentRole'] == UserType.AR) {
          this.EnableApproveButton = true;
          this.toasterService.error(innerRes['errorMsg'], 'Error');
        }

      }
    });
  }
  OnApproveApplicationForm() {
    if (this.approveStatus) {
      if (this.statusSectionName == "ADR SCORE") {
        this.ViewAccesPopupVisible = true;
        this.errorMessageForApprove = "Please filled the all requierd data in ADR Section.";
        // this.toasterService.error("Please filled the all requierd data in ADR Section.");
      }
    }
    else {
      let body = {};
      body['caseId'] = this.CaseId;
      body['partyId'] = this.PartyId;
      let encodedBody = formurlencoded(body);
      this.caseService.commonPostApiCall(CaseApiUrl.APPROVE_DUE_DILIGENCE, encodedBody, true).subscribe(res => {
        if (res['success']) {
          this.toasterService.success(res['errorMsg'], 'Due-Diligence Form Approve');
        }
        else {
          this.toasterService.error(res['errorMsg'], 'Error');
        }
      });
    }
  }
  //  =============================END ==================================== //
  handleRouteParams(): void {
    this.route.params.subscribe(params => {
      this.frmFetchCaseStatusDetail = {
        caseId: params['caseId'],
        partyId: params['partyId']
      }
      this.fetchCaseStatusDetail(this.frmFetchCaseStatusDetail);
    });
  }
  fetchCaseStatusDetail(params: any): void {
    this.caseService.commonPostApiCall(
      CaseApiUrl.FETCH_CASE_STATUS_DETAIL,
      formurlencoded(params), true
    ).subscribe(res => {
      if (res && res.success && res.data) {
        this.caseStatusDetail = res.data;
        for (let i = 0; i < res?.data?.dueDiligence.length; i++) {
          if (res?.data?.dueDiligence[i].status != 2) {
            this.approveStatus = true;
            if (res.data.dueDiligence[i].sectionName == 'ADR SCORE') {
              this.statusSectionName = res.data.applicationFormStatus[i].sectionName;
            }
            break;
          }
        }
        if (res.data.dueDiligenceAdminShare) {
          this.dueDeligenceAdminSharereturn = 'Yes';
        }
        else {
          this.dueDeligenceAdminSharereturn = 'No';
        }
      } else {
        this.toasterService.error(res.errorMsg, "Error");
      }
    });
  }
  popUpSubmitCall()
  {
    if (this.statusSectionName == "ADR SCORE") {
      this.myStepper.selectedIndex = 0;
      this.ViewAccesPopupVisible = false;
    }
  }
  OnPrevClick(e) {
   this.myStepper.previous();
  }
}
