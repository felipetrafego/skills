import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

/**
 * Envio de e-mail transacional. Sem provedor configurado (dev), apenas registra
 * a mensagem no log — nenhum e-mail sai da máquina. Em produção, plugar aqui um
 * provedor SMTP/API (SendGrid, SES, Resend…) sem tocar no restante do fluxo.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  get configured(): boolean {
    return !!this.config.get<string>("MAIL_PROVIDER");
  }

  async send(msg: MailMessage): Promise<void> {
    if (!this.configured) {
      this.logger.log(`[MAIL:dev] → ${msg.to} | ${msg.subject}\n${msg.text}`);
      return;
    }
    // TODO: integrar provedor real quando MAIL_PROVIDER estiver configurado.
    this.logger.warn(`MAIL_PROVIDER definido mas sem integração; mensagem para ${msg.to} não enviada.`);
  }
}
