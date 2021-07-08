/**
 * File: /src/passWebview/index.tsx
 * Project: pass
 * File Created: 08-07-2021 01:43:10
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 08-07-2021 02:40:00
 * Modified By: Clay Risser <email@clayrisser.com>
 * -----
 * Silicon Hills LLC (c) Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy otf the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { postMessage } from './vscodeApi';

postMessage({ type: 'ready' });

render(<App />, document.getElementById('pass'));
