import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { buildStaticMapUrl } from '../common/utils/mapbox.util';

type FoundPetNotificationPayload = {
  foundPet: {
    id: number;
    species: string;
    breed: string | null;
    color: string;
    size: string;
    description: string;
    photo_url: string | null;
    finder_name: string;
    finder_email: string;
    finder_phone: string;
    address: string;
    found_date: Date;
    created_at: Date;
    updated_at: Date;
    latitude: number;
    longitude: number;
  };
  lostPet: {
    id: number;
    name: string;
    species: string;
    breed: string;
    color: string;
    size: string;
    description: string;
    photo_url: string | null;
    owner_name: string;
    owner_email: string;
    owner_phone: string;
    address: string;
    lost_date: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    latitude: number;
    longitude: number;
    distance_meters: number;
  };
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure:
        this.configService.getOrThrow<string>('SMTP_SECURE').toLowerCase() ===
        'true',
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async sendFoundPetMatchNotification(
    payload: FoundPetNotificationPayload,
  ): Promise<void> {
    const mapUrl = buildStaticMapUrl({
      accessToken: this.configService.getOrThrow<string>('MAPBOX_ACCESS_TOKEN'),
      lostLatitude: payload.lostPet.latitude,
      lostLongitude: payload.lostPet.longitude,
      foundLatitude: payload.foundPet.latitude,
      foundLongitude: payload.foundPet.longitude,
    });

    const recipient = this.configService.getOrThrow<string>('NOTIFICATION_EMAIL');
    const subject = `PetRadar match: ${payload.lostPet.name} may match a found ${payload.foundPet.species}`;

    await this.transporter.sendMail({
      to: recipient,
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
      subject,
      text: this.buildTextBody(payload, mapUrl),
      html: this.buildHtmlBody(payload, mapUrl),
    });

    this.logger.log(
      `Notification sent for lost pet ${payload.lostPet.id} and found pet ${payload.foundPet.id}`,
    );
  }

  private buildTextBody(
    payload: FoundPetNotificationPayload,
    mapUrl: string,
  ): string {
    return [
      'A nearby lost pet match was detected.',
      '',
      'Found pet details:',
      `Species: ${payload.foundPet.species}`,
      `Breed: ${payload.foundPet.breed ?? 'N/A'}`,
      `Color: ${payload.foundPet.color}`,
      `Size: ${payload.foundPet.size}`,
      `Description: ${payload.foundPet.description}`,
      '',
      'Finder contact:',
      `Name: ${payload.foundPet.finder_name}`,
      `Email: ${payload.foundPet.finder_email}`,
      `Phone: ${payload.foundPet.finder_phone}`,
      '',
      'Lost pet reference:',
      `Name: ${payload.lostPet.name}`,
      `Species: ${payload.lostPet.species}`,
      `Address: ${payload.lostPet.address}`,
      `Distance: ${payload.lostPet.distance_meters.toFixed(2)} meters`,
      '',
      `Static map: ${mapUrl}`,
    ].join('\n');
  }

  private buildHtmlBody(
    payload: FoundPetNotificationPayload,
    mapUrl: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2>PetRadar nearby match detected</h2>
        <p>A found pet was registered within ${payload.lostPet.distance_meters.toFixed(2)} meters of an active lost pet report.</p>
        <h3>Found pet details</h3>
        <ul>
          <li><strong>Species:</strong> ${payload.foundPet.species}</li>
          <li><strong>Breed:</strong> ${payload.foundPet.breed ?? 'N/A'}</li>
          <li><strong>Color:</strong> ${payload.foundPet.color}</li>
          <li><strong>Size:</strong> ${payload.foundPet.size}</li>
          <li><strong>Description:</strong> ${payload.foundPet.description}</li>
        </ul>
        <h3>Finder contact</h3>
        <ul>
          <li><strong>Name:</strong> ${payload.foundPet.finder_name}</li>
          <li><strong>Email:</strong> ${payload.foundPet.finder_email}</li>
          <li><strong>Phone:</strong> ${payload.foundPet.finder_phone}</li>
        </ul>
        <h3>Lost pet reference</h3>
        <ul>
          <li><strong>Name:</strong> ${payload.lostPet.name}</li>
          <li><strong>Species:</strong> ${payload.lostPet.species}</li>
          <li><strong>Owner:</strong> ${payload.lostPet.owner_name}</li>
          <li><strong>Owner email:</strong> ${payload.lostPet.owner_email}</li>
          <li><strong>Owner phone:</strong> ${payload.lostPet.owner_phone}</li>
          <li><strong>Lost address:</strong> ${payload.lostPet.address}</li>
        </ul>
        <p><strong>Static map</strong></p>
        <p>
          <img src="${mapUrl}" alt="Static map showing lost and found pet locations" style="max-width: 100%; border-radius: 8px;" />
        </p>
      </div>
    `;
  }
}
