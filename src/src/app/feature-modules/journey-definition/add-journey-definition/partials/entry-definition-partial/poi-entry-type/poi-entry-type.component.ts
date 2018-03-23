import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { CommonService } from '../../../../../../core/base/utils/common.service';
import { MediaAcquisitionChannelType } from '../../../../model/media-acquisition-channel-Type';
import { LoggerService } from '../../../../../../core/base/logger/logger.service';
import { WorldRegionInfo } from '../../../../model/world-region-info';
import { DocumentCategory } from '../../../../model/document-category';
import { SupportedCaptureMediaChannels } from '../../../../model/supported-capture-media-channels';

@Component({
  selector: 'app-poi-entry-type',
  templateUrl: './poi-entry-type.component.html',
  styleUrls: ['./poi-entry-type.component.scss']
})
export class POIEntryTypeComponent implements OnInit, AfterViewInit {

  @Input() item: FormGroup;
  @Input() parentGroup: FormGroup;
  @Input() arrayName: string;
  @Input() groupName: number;

  @Input() supportedCaptureMediaChannels: SupportedCaptureMediaChannels[];
  @Input() worldRegionInfo: WorldRegionInfo[];
  @Input() documentCategories: DocumentCategory[];

  @Input() index;
  @ViewChild('supportedChannelTypesInput') supportedChannelTypesInput: ElementRef;

  // return current entry form group
  get documentProofPoliciesParentGroup(): FormGroup {
    const entriesArray = this.parentGroup.get(this.arrayName) as FormArray;
    return entriesArray.at(this.groupName) as FormGroup;
  }
  documentProofPoliciesArrayName = 'documentProofPolicies';

  constructor(private loggerService: LoggerService, private common: CommonService) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.initSelector();
  }
  initSelector() {
    $(this.supportedChannelTypesInput.nativeElement).selectpicker();
  }


  onChange(value: boolean) {
    if (!value) {
      this.item.controls['acceptExpiredUpToMonthes'].setValue('');
      this.item.controls['acceptExpiredUpToMonthes'].disable();
    } else {
      this.item.controls['acceptExpiredUpToMonthes'].enable();
    }
  }

}
