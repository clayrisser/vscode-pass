/**
 * File: /src/passWebview/content.ts
 * Project: pass
 * File Created: 08-07-2021 03:07:27
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 08-07-2021 03:11:20
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

import YAML from 'yaml';
import { HashMap } from '~/types';
import data from './data';

// TODO: improve content parsing
export function parseContent(content: string): HashMap<string> {
  const contentArr = content.split('\n');
  if (!contentArr.length) return {};
  if (contentArr[0].indexOf(':') <= -1) {
    contentArr[0] = `password: ${contentArr[0]}`;
  }
  const parsed = YAML.parse(contentArr.join('\n'));
  return parsed;
}

export default parseContent(data.content);
