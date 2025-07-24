/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { oauth2Authenticator } from '@backstage/plugin-auth-backend-module-oauth2-provider';
import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';

export const authModuleAdfsProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'adfs',
  register(env) {
    env.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'adfs',
          factory: createOAuthProviderFactory({
            authenticator: oauth2Authenticator,
            async signInResolver({ result: { fullProfile } }, ctx) {
              const email = fullProfile.email;
              if (!email) {
                throw new Error('User profile did not contain an email');
              }

              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: email.split('@')[0],
                namespace: DEFAULT_NAMESPACE,
              });

              return ctx.issueToken({
                claims: {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                },
              });
            },
          }),
        });
      },
    });
  },
});
