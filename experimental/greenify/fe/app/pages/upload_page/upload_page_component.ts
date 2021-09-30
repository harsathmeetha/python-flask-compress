import {HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {ACCEPTED_TYPES, MAX_SIZE} from 'google3/experimental/greenify/fe/app/components/file_uploader/file_uploader_component';
import {NotificationService} from 'google3/experimental/greenify/fe/app/services/notification_service';
import {UploadResponse, UploadService} from 'google3/experimental/greenify/fe/app/services/upload_service';
// import {NavigationExtras} from
// 'third_party/javascript/angular2/rc/packages/router/src/router.ts';

const UPLOAD_UI_STATE = {
  isReadyToUpload: 'isReadyToUpload',
  isUploading: 'isUploading',
  isProcessing: 'isProcessing',
  isError: 'isError'
} as const;

/**
 * greenify-upload-page component.
 */
@Component({
  selector: 'greenify-upload-page',
  templateUrl: './upload_page.ng.html',
  styleUrls: ['./upload_page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPageComponent implements OnInit {
  percentage = 0;
  response: UploadResponse = {};
  uploadUIStates = UPLOAD_UI_STATE;
  uploadUIState: string = UPLOAD_UI_STATE.isReadyToUpload;
  openFilePicker: boolean = false;
  // compressedImage = JSON;
  // oldImage = JSON;

  constructor(
      private readonly uploadService: UploadService,
      private readonly notificationService: NotificationService,
      private readonly route: ActivatedRoute,
      private readonly router: Router,
      private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.route.snapshot.fragment === 'open-file-picker') {
      this.openFilePicker = true;
    }
  }

  uploadFile(file: File) {
    if (this.isFileInvalid(file)) {
      return;
    }
    this.uploadUIState = UPLOAD_UI_STATE.isUploading;
    this.uploadService.uploadFile(file).subscribe(
        (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.percentage = Math.round(100 * event.loaded / event.total);
            this.changeDetectorRef.markForCheck();
            console.log(`File is ${this.percentage}% loaded.`);
            if (this.percentage === 100) {
              this.uploadUIState = this.uploadUIStates.isProcessing;
            }
          } else if (event instanceof HttpResponse) {
            this.response = event.body;
            console.log(this.response);
            console.log('File is completely loaded!');
          }
        },
        error => {
          this.notificationService.show(
              error?.message.startsWith('Http failure response') ?
                  'Something went wrong! Please try again later! :)' :
                  error?.message);
          this.uploadUIState = this.uploadUIStates.isReadyToUpload;
          this.changeDetectorRef.markForCheck();
        },
        () => {
          console.log('Upload done!');
          this.uploadUIState = this.uploadUIStates.isProcessing;
          // this.router.navigate(['/analysis'], {
          //   // 'images': {
          //   'compressedImage': this.response.compressedImage,
          //   'oldImage': this.response.oldImage
          //   // }
          // });
          const imagecompression = this.response;
          console.log(imagecompression, Response);
          this.router.navigate(['/analysis', imagecompression]);

          //   this.router.navigate(
          //       ['/analysis'],
          //       {queryParams: {images: JSON.stringify(this.response)}});


          // console.log('this.response = ', this.response);
          // const jObj = this.response as JSON;
          // console.log('json_obj = ', jObj);
          // const navigationExtras: NavigationExtras = {
          //   queryParams: {
          //     'responseObj': jObj,
          //   }
          // };
          // this.router.navigate(
          //     ['/analysis'], {queryParamsHandling: 'responseObj', jObj});


          // this.httpClient.get('assets/data.json').subscribe(data => {
          //   console.log(data);
          //   this.products = data;
          // })

          // console.log('Upload done!');
          // const responseObj = this.response;
          // console.log(responseObj);
          // this.uploadUIState = this.uploadUIStates.isProcessing;
          // this.router.navigate(['/analysis', responseObj]);

        });
  }

  isFileInvalid(file: File): boolean {
    if (!file) {
      this.notificationService.show('No file selected!');
      return true;
    }

    if (file.size > MAX_SIZE) {
      this.notificationService.show('File exceeded size in 10Mb!');
      return true;
    }

    const acceptedTypesRegEx = ACCEPTED_TYPES.split(',').join('|');
    if (!file.type.match(acceptedTypesRegEx)) {
      this.notificationService.show(`File type '${file.type}' not supported.`);
      return true;
    }

    return false;
  }
}
