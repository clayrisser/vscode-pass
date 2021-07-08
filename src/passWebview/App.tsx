/**
 * File: /src/passWebview/App.tsx
 * Project: pass
 * File Created: 08-07-2021 01:47:53
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 08-07-2021 03:55:35
 * Modified By: Clay Risser <email@clayrisser.com>
 * -----
 * Silicon Hills LLC (c) Copyright 2021
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

import React, { FC } from 'react';
import content from './content';
import data from './data';
import { Label, Input } from './components';

export interface AppProps {}

const App: FC<AppProps> = (_props: AppProps) => {
  function renderProperty(key: string, value: string) {
    let type = 'text';
    if (key === 'password') type = key;
    return (
      <tr
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          width: '100%',
          marginBottom: 8
        }}
        key={key}
      >
        <td style={{ textAlign: 'right' }}>
          <Label style={{ marginRight: 8 }}>{key}</Label>
        </td>
        <td style={{ width: '100%' }}>
          <Input
            style={{ width: '100%', fontSize: 16 }}
            id={key}
            name={key}
            type={type}
            value={value}
            disabled
          />
        </td>
      </tr>
    );
  }

  function renderContent() {
    return (
      <table style={{ width: '100%' }}>
        {Object.entries(content).map(([key, value]: [string, string]) =>
          renderProperty(key, value)
        )}
      </table>
    );
  }

  return (
    <div>
      <h1>{data.uri.replace(/^.*\//g, '').replace(/\.gpg$/g, '')}</h1>
      {renderContent()}
    </div>
  );
};

export default App;
