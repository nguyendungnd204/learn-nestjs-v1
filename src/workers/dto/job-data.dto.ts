export class EmailJobDto {
  to: string;
  subject: string;
  body: string;
  priority?: number;
}

export class ReportJobDto {
  reportType: string;
  userId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export class ImageProcessJobDto {
  imageUrl: string;
  operations: string[];
  userId: string;
}

export class BulkJobDto {
  count: number;
  jobType: 'email' | 'report' | 'image';
  data?: any;
}
