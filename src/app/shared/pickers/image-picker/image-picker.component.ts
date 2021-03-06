import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core'
import { Platform } from '@ionic/angular';
// import { PlaceLocation } from 'src/app/places/location.model';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @Output() imagePick = new EventEmitter<string | File>()
  @ViewChild('filePicker') fileInputRef: ElementRef<HTMLInputElement>
  @Input() showPreview = false

  selectedImage: string
  usePicker = false

  constructor(private platform: Platform) { }

  ngOnInit() {

    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')) {
      this.usePicker = true
    }
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0]

    if (!pickedFile) {
      return
    }

    const fr = new FileReader()
    fr.onload = () => {
      const dataUrl = fr.result.toString()
      this.selectedImage = dataUrl
      this.imagePick.emit(pickedFile)
    }
    fr.readAsDataURL(pickedFile)
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.fileInputRef.nativeElement.click()
      return
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,

      width: 600,
      resultType: CameraResultType.DataUrl
    }).then(image => {
      this.selectedImage = image.dataUrl
      this.imagePick.emit(this.selectedImage)
    }).catch(err => {
      if (this.usePicker) {
        this.fileInputRef.nativeElement.click()
      }

      return false
    })
  }
}
