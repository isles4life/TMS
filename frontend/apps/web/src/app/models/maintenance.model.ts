// Maintenance Module Models and Interfaces

export enum MaintenanceScheduleType {
  MileageBased = 0,
  TimeBased = 1,
  EngineHoursBased = 2,
  EventBased = 3
}

export enum MaintenanceTaskCategory {
  Inspection = 0,
  OilChange = 1,
  TireService = 2,
  BrakeService = 3,
  FluidCheck = 4,
  FilterReplacement = 5,
  BatteryService = 6,
  LightsAndElectrical = 7,
  SuspensionAndSteering = 8,
  EmissionSystem = 9,
  Other = 10
}

export enum MaintenanceRecordType {
  PreventativeMaintenance = 0,
  Repair = 1,
  Inspection = 2,
  Recall = 3,
  Warranty = 4,
  Emergency = 5
}

export enum MaintenanceRecordStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
  OnHold = 4
}

export enum VendorType {
  MaintenanceShop = 0,
  TireShop = 1,
  Dealer = 2,
  MobileService = 3,
  BodyShop = 4,
  GlassShop = 5,
  Upholstery = 6,
  Towing = 7,
  WashAndDetail = 8,
  Other = 9
}

export enum VendorStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
  PendingApproval = 3
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  message?: string;
}

// Maintenance Schedule DTOs
export interface CreateMaintenanceScheduleRequest {
  tractorId?: string;
  trailerId?: string;
  scheduleName: string;
  description?: string;
  scheduleType: MaintenanceScheduleType;
  mileageInterval?: number;
  daysInterval?: number;
  engineHoursInterval?: number;
  lastServiceDate?: Date;
  lastServiceMileage?: number;
  lastServiceEngineHours?: number;
  currentMileage?: number;
  currentEngineHours?: number;
  notificationDaysBefore?: number;
  isActive?: boolean;
}

export interface UpdateMaintenanceScheduleRequest {
  currentMileage?: number;
  currentEngineHours?: number;
  isActive?: boolean;
}

export interface MaintenanceScheduleResponse {
  id: string;
  tractorId?: string;
  trailerId?: string;
  scheduleName: string;
  description?: string;
  scheduleType: MaintenanceScheduleType;
  mileageInterval?: number;
  daysInterval?: number;
  engineHoursInterval?: number;
  lastServiceDate?: Date;
  lastServiceMileage?: number;
  lastServiceEngineHours?: number;
  currentMileage?: number;
  currentEngineHours?: number;
  nextServiceDueDate?: Date;
  nextServiceDueMileage?: number;
  nextServiceDueEngineHours?: number;
  daysUntilDue?: number;
  mileageUntilDue?: number;
  isOverdue: boolean;
  shouldNotify: boolean;
  notificationDaysBefore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Maintenance Task DTOs
export interface MaintenanceTaskResponse {
  id: string;
  maintenanceScheduleId: string;
  taskName: string;
  description?: string;
  category: MaintenanceTaskCategory;
  estimatedCost?: number;
  estimatedDurationMinutes?: number;
  isRequired: boolean;
  sortOrder: number;
}

// Maintenance Record DTOs
export interface CreateMaintenanceRecordRequest {
  tractorId?: string;
  trailerId?: string;
  maintenanceScheduleId?: string;
  vendorId?: string;
  recordType: MaintenanceRecordType;
  description?: string;
  serviceDate: Date;
  mileageAtService?: number;
  engineHoursAtService?: number;
  workOrderNumber?: string;
}

export interface CompleteMaintenanceRecordRequest {
  laborCost?: number;
  partsCost?: number;
  notes?: string;
}

export interface MaintenanceRecordResponse {
  id: string;
  workOrderNumber: string;
  tractorId?: string;
  trailerId?: string;
  maintenanceScheduleId?: string;
  vendorId?: string;
  vendorName?: string;
  recordType: MaintenanceRecordType;
  status: MaintenanceRecordStatus;
  description?: string;
  serviceDate: Date;
  completedDate?: Date;
  mileageAtService?: number;
  engineHoursAtService?: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  technicianName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Maintenance Record Item DTOs
export interface MaintenanceRecordItemRequest {
  itemType: string;
  description: string;
  quantity: number;
  unitCost: number;
  partNumber?: string;
}

export interface MaintenanceRecordItemResponse {
  id: string;
  maintenanceRecordId: string;
  itemType: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  partNumber?: string;
}

// Vendor DTOs
export interface CreateVendorRequest {
  vendorName: string;
  vendorCode?: string;
  vendorType: VendorType;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  licenseNumber?: string;
  licenseExpirationDate?: Date;
  serviceCapabilities?: string;
  specialtyAreas?: string;
  paymentTermsDays?: number;
  paymentMethod?: string;
  accountNumber?: string;
  hasInsurance?: boolean;
  insuranceExpirationDate?: Date;
  insuranceCoverageAmount?: number;
  isPreferred?: boolean;
  notes?: string;
}

export interface VendorResponse {
  id: string;
  vendorName: string;
  vendorCode?: string;
  vendorType: VendorType;
  status: VendorStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  taxId?: string;
  licenseNumber?: string;
  licenseExpirationDate?: Date;
  serviceCapabilities?: string;
  specialtyAreas?: string;
  rating: number;
  totalJobsCompleted: number;
  averageCompletionTime?: string; // TimeSpan from backend
  lastServiceDate?: Date;
  paymentTermsDays: number;
  paymentMethod?: string;
  accountNumber?: string;
  hasInsurance: boolean;
  insuranceExpirationDate?: Date;
  insuranceCoverageAmount?: number;
  isPreferred: boolean;
  isAvailable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UpdateVendorRatingRequest {
  newRating: number;
}

// Helper functions for enum display
export function getMaintenanceScheduleTypeName(type: MaintenanceScheduleType): string {
  switch (type) {
    case MaintenanceScheduleType.MileageBased: return 'Mileage Based';
    case MaintenanceScheduleType.TimeBased: return 'Time Based';
    case MaintenanceScheduleType.EngineHoursBased: return 'Engine Hours Based';
    case MaintenanceScheduleType.EventBased: return 'Event Based';
    default: return 'Unknown';
  }
}

export function getMaintenanceTaskCategoryName(category: MaintenanceTaskCategory): string {
  switch (category) {
    case MaintenanceTaskCategory.Inspection: return 'Inspection';
    case MaintenanceTaskCategory.OilChange: return 'Oil Change';
    case MaintenanceTaskCategory.TireService: return 'Tire Service';
    case MaintenanceTaskCategory.BrakeService: return 'Brake Service';
    case MaintenanceTaskCategory.FluidCheck: return 'Fluid Check';
    case MaintenanceTaskCategory.FilterReplacement: return 'Filter Replacement';
    case MaintenanceTaskCategory.BatteryService: return 'Battery Service';
    case MaintenanceTaskCategory.LightsAndElectrical: return 'Lights & Electrical';
    case MaintenanceTaskCategory.SuspensionAndSteering: return 'Suspension & Steering';
    case MaintenanceTaskCategory.EmissionSystem: return 'Emission System';
    case MaintenanceTaskCategory.Other: return 'Other';
    default: return 'Unknown';
  }
}

export function getMaintenanceRecordTypeName(type: MaintenanceRecordType): string {
  switch (type) {
    case MaintenanceRecordType.PreventativeMaintenance: return 'Preventative Maintenance';
    case MaintenanceRecordType.Repair: return 'Repair';
    case MaintenanceRecordType.Inspection: return 'Inspection';
    case MaintenanceRecordType.Recall: return 'Recall';
    case MaintenanceRecordType.Warranty: return 'Warranty';
    case MaintenanceRecordType.Emergency: return 'Emergency';
    default: return 'Unknown';
  }
}

export function getMaintenanceRecordStatusName(status: MaintenanceRecordStatus): string {
  switch (status) {
    case MaintenanceRecordStatus.Scheduled: return 'Scheduled';
    case MaintenanceRecordStatus.InProgress: return 'In Progress';
    case MaintenanceRecordStatus.Completed: return 'Completed';
    case MaintenanceRecordStatus.Cancelled: return 'Cancelled';
    case MaintenanceRecordStatus.OnHold: return 'On Hold';
    default: return 'Unknown';
  }
}

export function getVendorTypeName(type: VendorType): string {
  switch (type) {
    case VendorType.MaintenanceShop: return 'Maintenance Shop';
    case VendorType.TireShop: return 'Tire Shop';
    case VendorType.Dealer: return 'Dealer';
    case VendorType.MobileService: return 'Mobile Service';
    case VendorType.BodyShop: return 'Body Shop';
    case VendorType.GlassShop: return 'Glass Shop';
    case VendorType.Upholstery: return 'Upholstery';
    case VendorType.Towing: return 'Towing';
    case VendorType.WashAndDetail: return 'Wash & Detail';
    case VendorType.Other: return 'Other';
    default: return 'Unknown';
  }
}

export function getVendorStatusName(status: VendorStatus): string {
  switch (status) {
    case VendorStatus.Active: return 'Active';
    case VendorStatus.Inactive: return 'Inactive';
    case VendorStatus.Suspended: return 'Suspended';
    case VendorStatus.PendingApproval: return 'Pending Approval';
    default: return 'Unknown';
  }
}
