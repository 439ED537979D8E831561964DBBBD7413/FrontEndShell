import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JourneyDefinitionComponent } from './journey-definition.component';
import { CaseInsensitiveMatcher } from '../../core/base/url-case-insensitive/case-insensitive-matcher';
import { AuthenticatedGuard } from '../../core/auth/guards/authenticated.guard';
import { AuthorizedGuard } from '../../core/auth/guards/authorized.guard';
import { AuthClients } from '../../core/auth/model/auth-clients';
import { FrontendShell } from '../../core/auth/pages-access-authorization/app-pages-declaration/app-pages-declaration';
import { AccessLevelResolver } from '../../core/auth/services/access-level.resolver';
import { AddJourneyDefinitionComponent } from './add-journey-definition/add-journey-definition.component';

export function AddJourneyDefinitionMatch() {
  return CaseInsensitiveMatcher('New').apply(this, arguments);
}


const routes: Routes = [
  {
    path: '',
    component: JourneyDefinitionComponent,
  //  canActivate: [AuthenticatedGuard, AuthorizedGuard],
  //  canActivateChild: [AuthenticatedGuard, AuthorizedGuard],
    data: {
      authClient: AuthClients.FES,
      moduleName: FrontendShell.JourneyDefinition.Name
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'New' },
      {
        matcher: AddJourneyDefinitionMatch, component: AddJourneyDefinitionComponent,
        data: {
          moduleName: FrontendShell.JourneyDefinition.Name,
          pageName: FrontendShell.JourneyDefinition.Pages.AddJourneyDefinition
        },
        resolve: {
          accessLevel: AccessLevelResolver
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourneyDefinitionRoutingModule { }
