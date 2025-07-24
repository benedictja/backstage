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
  createOAuthAuthenticator,
  PassportOAuthAuthenticatorHelper,
  PassportOAuthDoneCallback,
  PassportProfile,
  commonSignInResolvers,
} from '@backstage/plugin-auth-node';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

// Create the ADFS authenticator
const adfsAuthenticator = createOAuthAuthenticator({
  defaultProfileTransform:
    PassportOAuthAuthenticatorHelper.defaultProfileTransform,
  scopes: {
    required: ['openid', 'profile', 'email'],
  },
  initialize({ callbackUrl, config }) {
    const clientId = config.getString('clientId');
    const clientSecret = config.getString('clientSecret');
    const authorizationUrl =
      config.getOptionalString('authorizationUrl') ||
      'https://adfs.example.com/adfs/oauth2/authorize';
    const tokenUrl =
      config.getOptionalString('tokenUrl') ||
      'https://adfs.example.com/adfs/oauth2/token';

    return PassportOAuthAuthenticatorHelper.from(
      new OAuth2Strategy(
        {
          clientID: clientId,
          clientSecret: clientSecret,
          authorizationURL: authorizationUrl,
          tokenURL: tokenUrl,
          callbackURL: callbackUrl,
          scope: ['openid', 'profile', 'email'],
        },
        (
          accessToken: string,
          refreshToken: string,
          params: any,
          profile: PassportProfile,
          done: PassportOAuthDoneCallback,
        ) => {
          done(
            undefined,
            { fullProfile: profile, params, accessToken },
            { refreshToken },
          );
        },
      ),
    );
  },
  async start(input, helper) {
    return helper.start(input, {});
  },
  async authenticate(input, helper) {
    return helper.authenticate(input, {});
  },
  async refresh(input, helper) {
    return helper.refresh(input);
  },
});

const authModuleAdfsProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'adfs',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'adfs',
          factory: createOAuthProviderFactory({
            authenticator: adfsAuthenticator,
            signInResolverFactories: {
              ...commonSignInResolvers,
            },
          }),
        });
      },
    });
  },
});

export { authModuleAdfsProvider };
export default authModuleAdfsProvider;
