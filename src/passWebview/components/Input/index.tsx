/**
 * File: /src/passWebview/components/Input/index.tsx
 * Project: pass
 * File Created: 08-07-2021 03:15:45
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 08-07-2021 03:20:34
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

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: FC<InputProps> = (props: InputProps) => (
  <input
    style={{
      ...props.style
    }}
    {...props}
  />
);

export default Input;
