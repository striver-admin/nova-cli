module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    parser: '@typescript-eslint/parser'
  },
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'prefer-const': 'off', // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    'no-use-before-define': 'off', // 禁止在 函数/类/变量 定义之前使用它们

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
    '@typescript-eslint/no-empty-function': 'error', // 禁止空函数
    '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
    '@typescript-eslint/ban-ts-comment': 'error', // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    '@typescript-eslint/no-inferrable-types': 'off', // 可以轻松推断的显式类型可能会增加不必要的冗长
    '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/ban-types': 'off', // 禁止使用特定类型
    '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 函数导入模块
    '@typescript-eslint/no-non-null-assertion': 'off', // 不允许使用后缀运算符的非空断言(!)
    // react
    'react/react-in-jsx-scope': 'off'
  }
};
