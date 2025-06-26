# Static Analysis Report – 20250626

## ESLint Output

```
No issues found.
```

## TypeScript Strict Output

```
src/components/layout/Header.tsx(3,39): error TS6133: 'Eclipse' is declared but its value is never read.
src/components/layout/UserMenu.tsx(9,3): error TS6133: 'DropdownMenuSeparator' is declared but its value is never read.
src/components/layout/UserMenu.tsx(22,9): error TS6133: 'navigate' is declared but its value is never read.
src/components/planner/PlanImagesGrid.tsx(65,33): error TS6133: 'snapshot' is declared but its value is never read.
src/components/planner/PlanImageUploadDialog.tsx(2,60): error TS6133: 'DialogTrigger' is declared but its value is never read.
src/components/planner/PlanImageUploadDialog.tsx(2,75): error TS6133: 'DialogClose' is declared but its value is never read.
src/components/planner/PlannerResourcesSection.tsx(74,18): error TS2345: Argument of type '(rs: PlanResource[]) => { id: string; title: string | null; url: string; }[]' is not assignable to parameter of type 'SetStateAction<PlanResource[]>'.
  Type '(rs: PlanResource[]) => { id: string; title: string | null; url: string; }[]' is not assignable to type '(prevState: PlanResource[]) => PlanResource[]'.
    Type '{ id: string; title: string | null; url: string; }[]' is not assignable to type 'PlanResource[]'.
      Type '{ id: string; title: string | null; url: string; }' is not assignable to type 'PlanResource'.
        Types of property 'title' are incompatible.
          Type 'string | null' is not assignable to type 'string'.
            Type 'null' is not assignable to type 'string'.
src/components/planner/PlannerSwatchesSection.tsx(27,5): error TS6133: 'setSwatches' is declared but its value is never read.
src/components/planner/PlannerTitleSection.tsx(3,1): error TS6192: All imports in import declaration are unused.
src/components/planner/PlannerTitleSection.tsx(25,3): error TS6133: 'saving' is declared but its value is never read.
src/components/planner/PlannerTitleSection.tsx(26,3): error TS6133: 'saveSuccess' is declared but its value is never read.
src/components/planner/PlannerTitleSection.tsx(27,3): error TS6133: 'saveError' is declared but its value is never read.
src/components/planner/PlannerYarnSection.tsx(27,5): error TS6133: 'setYarns' is declared but its value is never read.
src/components/planner/PlanYarnCard.tsx(3,1): error TS6133: 'Button' is declared but its value is never read.
src/components/planner/PlanYarnCard.tsx(5,1): error TS6192: All imports in import declaration are unused.
src/components/projects/ProjectCard.tsx(35,3): error TS6133: 'onTagsUpdate' is declared but its value is never read.
src/components/projects/ProjectForm.tsx(2,1): error TS6192: All imports in import declaration are unused.
src/components/projects/ProjectForm.tsx(108,9): error TS2719: Type '(data: FormData) => void' is not assignable to type '(data: FormData) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'FormData' is not assignable to type 'FormData'. Two different types with this name exist, but they are unrelated.
      Types of property 'hook_size' are incompatible.
        Type 'string' is not assignable to type '"" | "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"'.
src/components/projects/ProjectForm.tsx(123,9): error TS2719: Type '(data: FormData) => void' is not assignable to type '(data: FormData) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'FormData' is not assignable to type 'FormData'. Two different types with this name exist, but they are unrelated.
      Types of property 'hook_size' are incompatible.
        Type 'string' is not assignable to type '"" | "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"'.
src/components/projects/ProjectHeader.tsx(4,1): error TS6133: 'ProjectStatusChip' is declared but its value is never read.
src/components/projects/ProjectHeader.tsx(34,3): error TS6133: 'onBack' is declared but its value is never read.
src/components/projects/ProjectImageSection.tsx(24,3): error TS6133: 'onFormDataChange' is declared but its value is never read.
src/components/projects/ProjectsPage.tsx(3,1): error TS6133: 'supabase' is declared but its value is never read.
src/components/projects/ProjectsPage.tsx(40,58): error TS6133: 'loading' is declared but its value is never read.
src/components/projects/ProjectsPage.tsx(80,58): error TS6133: 'isFavorite' is declared but its value is never read.
src/components/projects/ProjectsPage.tsx(166,15): error TS2322: Type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | null' is not assignable to type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | undefined'.
  Type 'null' is not assignable to type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | undefined'.
src/components/projects/ProjectStatusChip.tsx(48,9): error TS6133: 'textSize' is declared but its value is never read.
src/components/projects/QRCodeGenerator.tsx(12,20): error TS7016: Could not find a declaration file for module 'qrcode'. '/Users/kim.oswalt/Library/CloudStorage/OneDrive-Skillable/Documents/GitHub/hooked-on-crochet/node_modules/qrcode/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/qrcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'qrcode';`
src/components/rows/RowCard.tsx(70,9): error TS6133: 'toast' is declared but its value is never read.
src/components/tags/TagListItem.tsx(2,1): error TS6133: 'useState' is declared but its value is never read.
src/components/ui/calendar.tsx(55,20): error TS6133: '_props' is declared but its value is never read.
src/components/ui/calendar.tsx(56,21): error TS6133: '_props' is declared but its value is never read.
src/components/ui/linkified-text.tsx(2,1): error TS6133: 'React' is declared but its value is never read.
src/context/NavigationContext.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/hooks/usePlanImages.ts(19,9): error TS6133: 'toast' is declared but its value is never read.
src/hooks/usePlanImagesReorder.ts(10,3): error TS6133: 'planId' is declared but its value is never read.
src/hooks/usePlanImagesReorder.ts(11,3): error TS6133: 'userId' is declared but its value is never read.
src/hooks/usePlanSwatchAttachments.ts(6,6): error TS6196: 'PlanSwatchAttachment' is declared but never used.
src/hooks/usePlanYarnAttachments.ts(6,6): error TS6196: 'PlanYarnAttachment' is declared but never used.
src/hooks/useProjectNavigation.ts(18,29): error TS6133: 'project' is declared but its value is never read.
src/hooks/useProjectNavigation.ts(38,27): error TS6133: 'selectedProject' is declared but its value is never read.
src/hooks/useProjectPlanAttachments.ts(9,6): error TS6196: 'Project' is declared but never used.
src/hooks/useTagOperations.ts(12,5): error TS2783: 'loading' is specified more than once, so this usage will be overwritten.
src/main.tsx(2,1): error TS6133: 'React' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(6,1): error TS6192: All imports in import declaration are unused.
src/pages/PlannerDetailPage.tsx(8,1): error TS6133: 'User' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(10,1): error TS6133: 'PlannerSection' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(17,1): error TS6133: 'Textarea' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(18,1): error TS6133: 'PlanImageUploadDialog' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(19,1): error TS6133: 'PlanImagesGrid' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(20,1): error TS6133: 'EmptyState' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(28,9): error TS6133: 'setPreviousPage' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(33,9): error TS6133: 'planName' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(45,10): error TS6133: 'images' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(46,10): error TS6133: 'imagesLoading' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(47,10): error TS6133: 'showImagesUpload' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(47,28): error TS6133: 'setShowImagesUpload' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(56,21): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/pages/PlannerDetailPage.tsx(162,9): error TS6133: 'handleImageAdded' is declared but its value is never read.
src/pages/PlannerDetailPage.tsx(179,9): error TS6133: 'handleDeleteImage' is declared but its value is never read.
src/pages/PlannerPage.tsx(4,1): error TS6133: 'Badge' is declared but its value is never read.
src/pages/PlannerPage.tsx(5,16): error TS6133: 'Palette' is declared but its value is never read.
src/pages/PlannerPage.tsx(5,25): error TS6133: 'Package' is declared but its value is never read.
src/pages/PlannerPage.tsx(5,34): error TS6133: 'Search' is declared but its value is never read.
src/pages/PlannerPage.tsx(5,42): error TS6133: 'X' is declared but its value is never read.
src/pages/PlannerPage.tsx(5,45): error TS6133: 'Trash' is declared but its value is never read.
src/pages/PlannerPage.tsx(6,1): error TS6192: All imports in import declaration are unused.
src/pages/PlannerPage.tsx(7,1): error TS6192: All imports in import declaration are unused.
src/pages/PlannerPage.tsx(8,1): error TS6133: 'Input' is declared but its value is never read.
src/pages/PlannerPage.tsx(9,1): error TS6133: 'Textarea' is declared but its value is never read.
src/pages/PlannerPage.tsx(10,1): error TS6192: All imports in import declaration are unused.
src/pages/PlannerPage.tsx(13,1): error TS6133: 'getYarnWeightLabel' is declared but its value is never read.
src/pages/PlannerPage.tsx(14,1): error TS6133: 'YarnForm' is declared but its value is never read.
src/pages/PlannerPage.tsx(15,1): error TS6133: 'SwatchForm' is declared but its value is never read.
src/pages/PlannerPage.tsx(57,9): error TS6133: 'yarnStash' is declared but its value is never read.
src/pages/PlannerPage.tsx(59,9): error TS6133: 'swatches' is declared but its value is never read.
src/pages/PlannerPage.tsx(67,15): error TS6133: 'query' is declared but its value is never read.
src/pages/PlannerPage.tsx(122,9): error TS6133: 'handleEditYarn' is declared but its value is never read.
src/pages/PlannerPage.tsx(126,9): error TS6133: 'handleEditSwatch' is declared but its value is never read.
src/pages/ProjectDetailPage.tsx(14,1): error TS6133: 'supabase' is declared but its value is never read.
src/pages/ProjectListPage.tsx(7,1): error TS6133: 'Plus' is declared but its value is never read.
src/pages/ProjectListPage.tsx(83,58): error TS6133: 'isFavorite' is declared but its value is never read.
src/pages/ProjectListPage.tsx(182,15): error TS2322: Type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | null' is not assignable to type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | undefined'.
  Type 'null' is not assignable to type '{ created_at: string; details: string | null; featured_image_url: string | null; hook_size: "1.5mm" | "1.75mm" | "2mm" | "2.2mm" | "3mm" | "3.5mm" | "4mm" | "4.5mm" | "5mm" | "5.5mm" | "6mm" | "6.5mm" | "9mm" | "10mm"; ... 7 more ...; yarn_weight: "1" | ... 6 more ... | "7"; } | undefined'.
src/pages/StashPage.tsx(35,40): error TS6133: 'loading' is declared but its value is never read.
src/pages/StashPage.tsx(80,13): error TS6133: 'data' is declared but its value is never read.
src/pages/SwatchesPage.tsx(73,44): error TS6133: 'imagesError' is declared but its value is never read.

```