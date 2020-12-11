import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import formurlencoded from 'form-urlencoded';
import { CaseService } from '../../services/case.service';
import { CaseApiUrl, EXPLANATION_INSTUCTION, GUIDELINE, UserType } from '../../models/enums/case.enums';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { DxFormComponent, DxRadioGroupComponent } from 'devextreme-angular';
import { CaseConfiguraions } from '../../models/config/case-configurations';
import { ToastrService } from 'ngx-toastr';
import { isEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-other-party-information',
  templateUrl: './other-party-information.component.html',
  styleUrls: ['./other-party-information.component.scss']
})
export class OtherPartyInformationComponent implements OnInit, OnDestroy {
  caseStatusDetail: any;
  defaultPhoneFormat: string;
  editStateId: number;
  editLawStateId: number;

  constructor(private route: ActivatedRoute, private caseService: CaseService, private toasterService: ToastrService) {
    //this.OnOtherPartyCountryValueChanged = this.OnOtherPartyCountryValueChanged.bind(this);
    this.setCountryValue = this.setCountryValue.bind(this);
    this.setLawCountryValue = this.setLawCountryValue.bind(this);
    this.GetStatesList = this.GetStatesList.bind(this);
    this.StateCountryUpdate = this.StateCountryUpdate.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.route.params.subscribe(p => {
      this.CaseId = p['caseId'];
      this.PartyId = p['partyId'];
    });
  }
  @Output() OnOtherPartySave: EventEmitter<any> = new EventEmitter();
  @Output() OnPrevButtonClick: EventEmitter<any> = new EventEmitter();
  @Output() OnNextButtonClick: EventEmitter<any> = new EventEmitter();
  @ViewChild('commentForm') commentForm: DxFormComponent;
  @ViewChild('FrmNotification') FrmNotification: DxFormComponent;
  @ViewChild("NotificationOptionRadioGroup") NotificationOptionRadioGroup: DxRadioGroupComponent;
  defaultPhoneMask = CaseConfiguraions.defaultPhoneMask;
  explanationAndInformation: string = EXPLANATION_INSTUCTION.otherPartyInfoExplanation;
  addOtherPartyGuidLine: string = GUIDELINE.addOtherPartyGuidLine;
  CaseId: number;
  PartyId: number;
  OtherPartyStateList = [];
  LawyerStateList = [];
  CountryList = [];
  StateList = [];
  SelectedPartyType: number;
  OtherPartyState: {
    countryId: number,
    stateId: number
  }
  NotificationTypes = [];
  SelectednotificationTypes: number;
  notificationPartyType: number;
  SelectedNotificationOption = [];
  isNotificationsVisible: boolean = false;
  controlConfig = {};
  commentText: any = "";
  participantTypes = [{ value: 1, text: 'Essential Participant' }, { value: 2, text: 'Non-Essential Participant' }];
  selectedParticipant = this.participantTypes[0].value;
  Loaded = false;
  notificationOption: number;
  ApplicationFormData = {};
  editApplicationFormPermission: boolean = false;
  userActionOnEdit: boolean = false;
  CurrentAppFormsubscription: Subscription;
  OtherPartiesUser = {};
  ngOnInit() {
    this.defaultPhoneFormat = CaseConfiguraions.defaultPhoneFormat;
    this.fetchComment();
    this.fetchCaseOtherParty();
    this.CurrentAppFormsubscription = this.caseService.CurrentApplicationFormData.subscribe(data => {
      this.ApplicationFormData = data;
      this.editApplicationFormPermission = data?.editApplicationFormPermission;
      if (data?.OtherPartiesList) {
        this.OtherPartyState = {
          countryId: data?.OtherPartiesList?.countryId,
          stateId: data?.OtherPartiesList?.stateId,
        }
      }
    });
  }
  setCountryValue(rowData: any, value: any): void {
    rowData.stateId = null;
    rowData.countryId = value;
    this.GetStatesList(value, 'OtherParty');
  }
  setLawCountryValue(rowData: any, value: any): void {
    rowData.partyLegalCounselLawyerStateId = null;
    rowData.partyLegalCounselLawyerCountryId = value;
    this.GetStatesList(value, 'Lawyer');
  }
  public GetStatesList(CountryId: number, type: string) {
    if (CountryId) {
      let body = {};
      body['countryId'] = CountryId;
      let encoded = formurlencoded(body);
      this.caseService.commonGetApiCall(CaseApiUrl.GET_STATES + encoded, null).subscribe(data => {
        if (data['success']) {
          if (type == 'Lawyer') {
            this.LawyerStateList = data.data.states.map(({ stateId, stateName }) => ({ Value: stateId, Text: stateName }));
          }
          else if (type == 'OtherParty') {
            this.OtherPartyStateList = data.data.states.map(({ stateId, stateName }) => ({ Value: stateId, Text: stateName }));
          }
          else if (type == 'Party') {
            this.StateList = data.data.states.map(({ stateId, stateName }) => ({ Value: stateId, Text: stateName }));
          }
        }
      });
    }
  }
  saveOtherPartyInformation(e) {
    var state, lawState;
    if (e.data.stateId == null || e.data.stateId == undefined) {
      if (e.data.countryId != null) {
        state = 0;
      }
      // else {
      //   state = e.data.stateId;
      // }
    }
    else{
      state = e.data.stateId;
    }
    if (e.data.partyLegalCounselLawyerStateId == null) {
      if (e.data.partyLegalCounselLawyerCountryId != null) {
        lawState = 0;
      }
      // else{
      //   lawState = e.data.partyLegalCounselLawyerStateId;
      // }
    }
    else {
      lawState = e.data.partyLegalCounselLawyerStateId;
    }
    // if()
    // {
    //   lawState=0;
    // }
    // else{

    // }
    let reqBody: object = {
      partyId: Number(this.PartyId),
      caseId: Number(this.CaseId),
      otherPartyFullLegelName: e.data.partyFullLegelName,
      otherPartyAddressLine1: e.data.partyAddressLine1,
      otherPartyAddressLine2: e.data.partyAddressLine2,
      otherPartyAddressLine3: e.data.partyAddressLine3,
      otherPartyCity: e.data.city,
      otherPartyZipcode: e.data.zipCode,
      otherPartyOfficeNumber: e.data.officeNumber,
      otherPartyMobileNumber: e.data.mobileNumber,
      otherPartyEmail: e.data.emailAddress,
      otherPartyCountryId: e.data.countryId,
      otherPartyStateId: state,
      otherPartyType: e.data.partyType,
      otherPartyPrimaryContactEmail: e.data.emailAddress,
      otherPartyPrimaryContactJobTitle: e.data.partyPrimaryContactJobTitle,
      otherPartyPrimaryContactPhoneNumber: e.data.officeNumber,
      // Added field start
      otherPartyPrimaryContactLastName: e.data.partyPrimaryContactLastName,
      otherPartyPrimaryContactName: e.data.partyPrimaryContactName,
      otherPartyLegalCounselLawFirm: e.data.partyLegalCounselLawFirm,
      otherPartyLegalCounselLawyerLastName: e.data.partyLegalCounselLawyerLastName,
      otherPartyLegelCounselName: e.data.partyLegelCounselName,
      otherPartyLegalCounselLawyerEmailAddress: e.data.partyLegalCounselLawyerEmailAddress,
      otherPartyLegalCounselLawyerMobileNumber: e.data.partyLegalCounselLawyerMobileNumber,
      otherPartyLegalCounselLawyerPhoneNumber: e.data.partyLegalCounselLawyerPhoneNumber,
      otherPartyLegalCounselAddressLine1: e.data.partyLegalCounselLawyerAddressLine1,
      otherPartyLegalCounselAddressLine2: e.data.partyLegalCounselLawyerAddressLine2,
      otherPartyLegalCounselAddressLine3: e.data.partyLegalCounselLawyerAddressLine3,
      otherpartyLegalCounselcity: e.data.partyLegalCounselLawyerCity,
      otherPartyLegalCounselzipCode: e.data.partyLegalCounselLawyerZipCode,
      otherPartyLegalCounselcountryId: e.data.partyLegalCounselLawyerCountryId,
      otherPartyLegalCounselstateId: lawState
      //Added field end
    };
    let body = {};
    body = formurlencoded(reqBody);
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_OTHER_PARTY, body, true).subscribe(res => {
      if (res.success) {
        this.toasterService.success(res['errorMsg'], 'Success');
        this.fetchCaseOtherParty();
        this.fetchCaseStatusDetail(this.CaseId, this.PartyId);
      }
      else {
        this.toasterService.error(res['errorMsg'], 'Error');
      }
    });
    this.GetStatesList(Number(e.data.countryId), "OtherParty");
    // this.fetchCaseStatusDetail(this.CaseId,this.PartyId);
  }
  OnOtherPartyInfoEditSubmit(e) {
    // if (e.oldData.stateId == null) {
    //   state = 0;
    // }
    // else if (e.oldData.partyLegalCounselLawyerStateId == null || e.oldData.partyLegalCounselLawyerStateId == undefined) {
    //   lawState = 0;
    // }
    // else {

    // }
    for (const key in e.newData) {
      if (e.newData.hasOwnProperty(key)) {
        const element = e.newData[key];
        e.oldData[key] = element;
      }
    }
  
    if (e.oldData.stateId == null || e.oldData.stateId == undefined) {
      this.editStateId = 0;
    }
    else {
      if (e.oldData.stateId != null) {
        this.editStateId = e.oldData.stateId;
      }
    }
    if (e.oldData.partyLegalCounselLawyerStateId == null || e.oldData.partyLegalCounselLawyerStateId == undefined) {
      this.editLawStateId = 0;
    }
    else{
      if(e.oldData.partyLegalCounselLawyerStateId != null){
        this.editLawStateId = e.oldData.partyLegalCounselLawyerStateId;
      }
    }
    let body = {};
    body['partyId'] = this.PartyId;
    body['caseId'] = this.CaseId;
    body['otherPartyId'] = e.oldData.partyId;
    body['otherPartyDisputantName'] = e.oldData.partyFullLegelName;
    body['otherPartyFullLegelName'] = e.oldData.partyFullLegelName;
    body['otherPartyLegelCounselName'] = e.oldData.partyLegelCounselName;
    body['otherPartyAddressLine1'] = e.oldData.partyAddressLine1;
    body['otherPartyAddressLine2'] = e.oldData.partyAddressLine2;
    body['otherPartyAddressLine3'] = e.oldData.partyAddressLine3;
    body['otherPartyCity'] = e.oldData.city;
    body['otherPartyZipcode'] = e.oldData.zipCode;
    body['otherPartyOfficeNumber'] = e.oldData.officeNumber;
    body['otherPartyMobileNumber'] = e.oldData.mobileNumber;
    body['otherPartyEmail'] = e.oldData.emailAddress;
    body['otherPartyCountryId'] = e.oldData.countryId;
    body['otherPartyStateId'] = this.editStateId;
    body['otherPartyType'] = e.oldData.partyType;
    body['otherPartyPrimaryContactName'] = e.oldData.partyPrimaryContactName;
    body['otherPartyPrimaryContactEmail'] = e.oldData.emailAddress;
    body['otherPartyPrimaryContactJobTitle'] = e.oldData.partyPrimaryContactJobTitle;
    body['otherPartyPrimaryContactPhoneNumber'] = e.oldData.mobileNumber;
    body['otherPartyPrimaryContactLastName'] = e.oldData.partyPrimaryContactLastName;
    body['otherPartyLegalCounselLawFirm'] = e.oldData.partyLegalCounselLawFirm;
    body['otherPartyLegalCounselLawyerLastName'] = e.oldData.partyLegalCounselLawyerLastName;
    body['otherPartyLegelCounselName'] = e.oldData.partyLegelCounselName;
    body['otherPartyLegalCounselLawyerEmailAddress'] = e.oldData.partyLegalCounselLawyerEmailAddress;
    body['otherPartyLegalCounselLawyerMobileNumber'] = e.oldData.partyLegalCounselLawyerMobileNumber;
    body['otherPartyLegalCounselLawyerPhoneNumber'] = e.oldData.partyLegalCounselLawyerPhoneNumber;
    body['otherPartyLegalCounselAddressLine1'] = e.oldData.partyLegalCounselLawyerAddressLine1;
    body['otherPartyLegalCounselAddressLine2'] = e.oldData.partyLegalCounselLawyerAddressLine2;
    body['otherPartyLegalCounselAddressLine3'] = e.oldData.partyLegalCounselLawyerAddressLine3;
    body['otherpartyLegalCounselcity'] = e.oldData.partyLegalCounselLawyerCity;
    body['otherPartyLegalCounselzipCode'] = e.oldData.partyLegalCounselLawyerZipCode;
    body['otherPartyLegalCounselcountryId'] = e.oldData.partyLegalCounselLawyerCountryId;
    body['otherPartyLegalCounselstateId'] = this.editLawStateId;
    // this.OnOtherPartySave.emit(body);
    body = formurlencoded(body);
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_OTHER_PARTY, body, true).subscribe(res => {
      if (res.success) {
        this.toasterService.success(res['errorMsg'], 'Success');
        this.fetchCaseOtherParty();
        this.fetchCaseStatusDetail(this.CaseId, this.PartyId);
      }
      else {
        this.toasterService.error(res['errorMsg'], 'Error');
      }
    });
  }
  fetchCaseOtherParty() {
    let body = {}
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    let encodedBody = formurlencoded(body);
    this.caseService.commonPostApiCall(CaseApiUrl.FETCH_CASE_OTHER_PARTIES, encodedBody, true).subscribe(res => {
      if (res['success']) {
        this.OtherPartiesUser = res?.data?.parties;
      }
      else {
        this.toasterService.error(res['errorMsg'], 'Error');
      }
    });
  }
  fetchCaseStatusDetail(caseId, partyId): void {
    let reqBody = {
      caseId: caseId,
      partyId: partyId
    };
    reqBody = formurlencoded(reqBody);
    this.caseService.commonPostApiCall(
      CaseApiUrl.FETCH_CASE_STATUS_DETAIL, reqBody, true
    ).subscribe(res => {
      if (res && res.success && res.data) {
        this.caseService.currentUserSave(res);
      } else {
        this.toasterService.error(res.errorMsg, "Error");
      }
    });
  }
  StateCountryUpdate(e) {
    this.GetStatesList(Number(e.data.countryId), "OtherParty");
    this.GetStatesList(Number(e.data.partyLegalCounselLawyerCountryId), "Lawyer");
    // if(e.data.emailAddress == "Unknown" && e.data.partyFullLegelName == "Unknown" && e.data.partyPrimaryContactEmailAddress == "Unknown"){
    // //this.editApplicationFormPermission=false;
    // this.userActionOnEdit= true;

    // }
    // else{
    //   this.userActionOnEdit= false;

    // }
  }
  onEditorPreparing(e) {
    if (e.row.data != null || e.row.data != undefined) {
      this.userActionOnEdit = false;
      e.editorOptions.readOnly = false;
    }
    if (e.row.data.emailAddress == "Unknown") {
      this.userActionOnEdit = true;
      e.editorOptions.readOnly = true;
    }
    if (e.row.data.stateId == null || e.row.data.stateId == undefined) {
      this.editStateId = 0;
    }
    else if (e.row.data.partyLegalCounselLawyerStateId == null || e.row.data.partyLegalCounselLawyerStateId == undefined) {
      this.editLawStateId = 0;
    }
  }

  ngOnDestroy() {
    this.CurrentAppFormsubscription.unsubscribe();
  }
  OnPrevClick() {
    this.OnPrevButtonClick.emit();
  }
  AddComment() {

   // this.FrmNotification.instance.validate();
    // if (this.FrmNotification.instance.validate()) {
    //   if (this.NotificationOptionRadioGroup.value) {
    //     this.notificationOption = this.NotificationOptionRadioGroup.value;

    //   }
    // }
    let body = {};
    body['partyId'] = this.PartyId;
    body['caseId'] = this.CaseId;
    body['commentText'] = this.commentText;
    body['commentModule'] = "OtherParty Information";
    body['commentType'] = 0;
   // body['notificationOption'] = this.notificationOption;
    let encoded = formurlencoded(body);
    this.caseService.commonPostApiCall(CaseApiUrl.ADD_OR_UPDATE_CASE_PARTY_COMMENT, encoded, true).subscribe(res => {
      if (res['success']) {
        this.toasterService.success(res['errorMsg'], 'Success');
      }
      else {
        // this.toasterService.error(res['errorMsg'], 'Error');
      }
    });

  }
  fetchComment() {
    let body = {};
    body['caseId'] = this.CaseId;
    body['partyId'] = this.PartyId;
    body['module'] = "OtherParty Information";
    body['commentType'] = 0;
    let encodedBody = formurlencoded(body);
    this.caseService.commonPostApiCall(CaseApiUrl.FETCH_CASE_PARTY_COMMENTS, encodedBody, true, false).subscribe(data => {
      if (data['success']) {
        //this.toasterService.success(data['errorMsg'], 'Success');
        this.commentText = data?.data?.casePartyComment?.commentText;
      }
      else {
        // this.toasterService.error(data['errorMsg'], 'Error');
      }
    });
  }
  
  OnNextClick() {
    this.AddComment();
    this.OnNextButtonClick.emit('');
  }

  phoneValidation(e: any): boolean {
    return (e.value) ? new RegExp(CaseConfiguraions.REGEX_PHONENUMBER_VALIDATION).test(e.value) : true;
  }
}