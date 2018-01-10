import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';

import { LoggerService } from '../services/log4ts/logger.service';

export class TimingInterceptor implements HttpInterceptor {
  constructor(private loggerService: LoggerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();
    return next
      .handle(req)
      .do(event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          this.loggerService.log(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
        }
      });
  }
}
