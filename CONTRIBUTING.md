# Contributing to @haikal/react-pdf-viewer

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🎯 Project Goal

This library is part of a thesis project focused on developing a React-based library for multi-format document preview in Next.js framework. The current phase focuses on PDF preview functionality.

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/haikal/react-pdf-viewer.git
   cd react-pdf-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build the library**
   ```bash
   npm run build:lib
   ```

## 📁 Project Structure

```
react-pdf-viewer/
├── src/
│   ├── lib/                    # Library source code
│   │   ├── components/         # React components
│   │   │   ├── PDFPreview.tsx
│   │   │   └── PDFUploadPreview.tsx
│   │   └── index.ts           # Library exports
│   └── app/                   # Next.js app (examples)
│       ├── page.tsx           # Home page
│       ├── example-simple/    # Simple preview example
│       └── example-upload/    # Upload UI example
├── public/                    # Static assets
├── dist/                      # Build output (gitignored)
└── package.json
```

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use Tailwind CSS for styling

### Component Guidelines

1. **Client Components**: All library components should be client components (`"use client"`)
2. **TypeScript**: Provide proper TypeScript types and interfaces
3. **Props**: Document all props with JSDoc comments
4. **Error Handling**: Implement proper error handling
5. **Loading States**: Show loading indicators for async operations

### Testing

Before submitting a PR:

1. Test with Next.js 14 and 15
2. Test with different PDF files (various sizes and formats)
3. Test error scenarios (invalid files, network errors, etc.)
4. Verify TypeScript types work correctly
5. Check browser compatibility

### Commit Messages

Use clear and descriptive commit messages:

```
feat: add zoom reset functionality
fix: resolve PDF rendering issue on Safari
docs: update README with new examples
style: improve button hover states
refactor: optimize PDF loading logic
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: 
   - Next.js version
   - React version
   - Browser and version
   - OS
6. **Screenshots**: If applicable

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Provide a clear use case
3. Explain why this feature would be useful
4. Consider if it aligns with the project goals

## 📝 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new components/functions
- Update CHANGELOG.md
- Add examples if introducing new features

## 🔄 Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the style guidelines
   - Add/update tests if needed

3. **Test thoroughly**
   - Run `npm run dev` and test manually
   - Check for TypeScript errors
   - Verify examples still work

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changes you made and why

## 📋 Checklist for PRs

- [ ] Code follows the project style guidelines
- [ ] TypeScript types are properly defined
- [ ] JSDoc comments added for public APIs
- [ ] Changes tested in development environment
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated
- [ ] No console errors or warnings
- [ ] Works in latest Chrome, Firefox, Safari, and Edge

## 🎓 Project Phases

This is phase 1 (PDF Preview) of the thesis project. Future phases:

- [ ] Phase 2: DOCX Preview
- [ ] Phase 3: TXT Preview
- [ ] Phase 4: Image Preview
- [ ] Phase 5: Excel Preview
- [ ] Phase 6: PowerPoint Preview

Contributions related to future phases are welcome!

## 📞 Contact

For questions or discussions:

- Open an issue on GitHub
- Email: [your-email@example.com]

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this library better! 🙏

