import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProofOfDeliveryService, ProofOfDeliveryDto, AddPODPhotoDto, SignProofOfDeliveryDto } from '../services/proof-of-delivery.service';

declare var SignaturePad: any;

@Component({
  selector: 'tms-pod-capture',
  templateUrl: './pod-capture.component.html',
  styleUrls: ['./pod-capture.component.scss']
})
export class PODCaptureComponent implements OnInit {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas: any;

  podForm: FormGroup;
  currentPOD: ProofOfDeliveryDto | null = null;
  signaturePad: any;
  photos: AddPODPhotoDto[] = [];
  totalPhotoSize = 0;
  maxPhotoSize = 100 * 1024 * 1024; // 100MB total
  maxPhotoIndividualSize = 10 * 1024 * 1024; // 10MB per photo

  photoTypes = [
    { value: 0, label: 'Load Condition' },
    { value: 1, label: 'Signed Documents' },
    { value: 2, label: 'Delivery Proof' },
    { value: 3, label: 'Damage Report' },
    { value: 4, label: 'Safety Compliance' },
    { value: 5, label: 'Other' }
  ];

  podStatus = {
    0: 'Draft',
    1: 'Pending',
    2: 'Signed',
    3: 'Completed',
    4: 'Rejected',
    5: 'Cancelled'
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentStep: 'capture' | 'sign' | 'review' = 'capture';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private podService: ProofOfDeliveryService
  ) {
    this.podForm = this.fb.group({
      recipientName: ['', Validators.required],
      signatureData: ['', Validators.required],
      deliveryNotes: [''],
      selectedPhotoType: [0],
      photoDescription: [''],
      latitude: [''],
      longitude: ['']
    });
  }

  ngOnInit(): void {
    const podId = this.route.snapshot.paramMap.get('id');
    if (podId) {
      this.loadPOD(podId);
    }
    this.initializeSignaturePad();
  }

  ngAfterViewInit(): void {
    this.initializeSignaturePad();
  }

  private loadPOD(id: string): void {
    this.isLoading = true;
    this.podService.getProofOfDelivery(id).subscribe({
      next: (pod) => {
        this.currentPOD = pod;
        this.isLoading = false;
        this.determineCurrentStep();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load POD: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  private determineCurrentStep(): void {
    if (!this.currentPOD) return;

    if (this.currentPOD.status === 0) {
      this.currentStep = 'capture';
    } else if (this.currentPOD.status === 2) {
      this.currentStep = 'sign';
    } else {
      this.currentStep = 'review';
    }
  }

  private initializeSignaturePad(): void {
    if (this.signatureCanvas && !this.signaturePad) {
      setTimeout(() => {
        const canvas = this.signatureCanvas.nativeElement;
        this.signaturePad = new SignaturePad(canvas, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          penColor: 'rgb(0, 0, 0)'
        });
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
      }, 100);
    }
  }

  private resizeCanvas(): void {
    if (!this.signaturePad || !this.signatureCanvas) return;
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    this.signaturePad.clear();
  }

  onPhotoSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.size > this.maxPhotoIndividualSize) {
        this.errorMessage = `Photo ${file.name} exceeds 10MB limit`;
        continue;
      }

      if (this.totalPhotoSize + file.size > this.maxPhotoSize) {
        this.errorMessage = 'Total photo size would exceed 100MB limit';
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const photoDto: AddPODPhotoDto = {
          photoType: this.podForm.value.selectedPhotoType,
          photoUrl: e.target.result,
          fileSizeBytes: file.size,
          description: this.podForm.value.photoDescription,
          latitude: this.podForm.value.latitude ? parseFloat(this.podForm.value.latitude) : undefined,
          longitude: this.podForm.value.longitude ? parseFloat(this.podForm.value.longitude) : undefined
        };

        this.photos.push(photoDto);
        this.totalPhotoSize += file.size;
        this.successMessage = `Photo added (${(this.totalPhotoSize / 1024 / 1024).toFixed(1)}MB total)`;
        
        // Reset form
        this.podForm.patchValue({
          photoDescription: '',
          latitude: '',
          longitude: ''
        });
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.podForm.patchValue({ signatureData: '' });
    }
  }

  removePhoto(index: number): void {
    const photo = this.photos[index];
    this.totalPhotoSize -= photo.fileSizeBytes;
    this.photos.splice(index, 1);
  }

  async captureLocation(): Promise<void> {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.podForm.patchValue({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          this.successMessage = 'Location captured successfully';
        },
        (error) => {
          this.errorMessage = 'Failed to get location: ' + error.message;
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by your browser';
    }
  }

  async uploadPhotos(): Promise<void> {
    if (!this.currentPOD || this.photos.length === 0) {
      this.errorMessage = 'No photos to upload';
      return;
    }

    this.isLoading = true;
    try {
      for (const photo of this.photos) {
        await this.podService.addPhoto(this.currentPOD.id, photo).toPromise();
      }
      this.photos = [];
      this.totalPhotoSize = 0;
      this.successMessage = 'Photos uploaded successfully';
      this.currentStep = 'sign';
    } catch (error: any) {
      this.errorMessage = 'Failed to upload photos: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async signPOD(): Promise<void> {
    if (!this.currentPOD || !this.podForm.valid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.errorMessage = 'Please capture your signature';
      return;
    }

    this.isLoading = true;
    try {
      const signatureData = this.signaturePad.toDataURL();
      const signDto: SignProofOfDeliveryDto = {
        recipientName: this.podForm.value.recipientName,
        signatureData: signatureData,
        deliveryDateTime: new Date(),
        deliveryNotes: this.podForm.value.deliveryNotes,
        latitude: this.podForm.value.latitude ? parseFloat(this.podForm.value.latitude) : undefined,
        longitude: this.podForm.value.longitude ? parseFloat(this.podForm.value.longitude) : undefined
      };

      const result = await this.podService.signProofOfDelivery(this.currentPOD.id, signDto).toPromise();
      this.currentPOD = result!;
      this.successMessage = 'POD signed successfully';
      this.currentStep = 'review';
    } catch (error: any) {
      this.errorMessage = 'Failed to sign POD: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async completePOD(): Promise<void> {
    if (!this.currentPOD) return;

    this.isLoading = true;
    try {
      const result = await this.podService.completeProofOfDelivery(
        this.currentPOD.id,
        { exceptionNotes: this.podForm.value.deliveryNotes }
      ).toPromise();

      this.currentPOD = result!;
      this.successMessage = 'POD completed successfully';
      setTimeout(() => {
        this.router.navigate(['/dispatch']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = 'Failed to complete POD: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }

  getStatusLabel(status: number): string {
    return this.podStatus[status as keyof typeof this.podStatus] || 'Unknown';
  }

  getPhotoTypeLabel(type: number): string {
    return this.photoTypes.find(t => t.value === type)?.label || 'Unknown';
  }
}
