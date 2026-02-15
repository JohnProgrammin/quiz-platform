# Before & After Code Examples

## Example 1: Logo Component (Logo.jsx)

### BEFORE:
```jsx
<span className={`${sizeClasses[size]} gradient-text tracking-tight ${className}`}>
  floraquiz
</span>
```

### AFTER:
```jsx
<span className={`${sizeClasses[size]} text-brand-500 tracking-tight ${className}`}>
  floraquiz
</span>
```

---

## Example 2: Dashboard Button (Dashboard.jsx)

### BEFORE:
```jsx
<button
  onClick={() => navigate('/notes')}
  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white font-black rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
>
  SUBMIT
</button>
```

### AFTER:
```jsx
<button
  onClick={() => navigate('/notes')}
  className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 text-white font-black rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
>
  SUBMIT
</button>
```

---

## Example 3: Navbar Premium Badge (Navbar.jsx)

### BEFORE:
```jsx
<span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white ml-1">
  PREMIUM
</span>
```

### AFTER:
```jsx
<span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-400 text-white ml-1">
  PREMIUM
</span>
```

---

## Example 4: Dashboard Recent Activity Hover (Dashboard.jsx)

### BEFORE:
```jsx
<div
  className="px-8 py-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-white cursor-pointer transition-all duration-200 flex items-center justify-between group"
>
  {/* content */}
</div>
```

### AFTER:
```jsx
<div
  className="px-8 py-6 hover:bg-green-50 cursor-pointer transition-all duration-200 flex items-center justify-between group"
>
  {/* content */}
</div>
```

---

## Example 5: Analytics Chart Bar (Analytics.jsx)

### BEFORE:
```jsx
<div
  className="w-full bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 ease-out"
  style={{
    height: `${(day.score / 100) * 100}%`,
  }}
/>
```

### AFTER:
```jsx
<div
  className="w-full bg-brand-500 transition-all duration-500 ease-out"
  style={{
    height: `${(day.score / 100) * 100}%`,
  }}
/>
```

---

## Example 6: Payment Callback Page (PaymentCallback.jsx)

### BEFORE:
```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
  {/* content */}
</div>
```

### AFTER:
```jsx
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  {/* content */}
</div>
```

---

## Example 7: Upgrade Button (UpgradePrompt.jsx)

### BEFORE:
```jsx
<button
  onClick={() => navigate('/pricing')}
  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
>
  <Crown className="w-4 h-4" />
  Upgrade to Pro
</button>
```

### AFTER:
```jsx
<button
  onClick={() => navigate('/pricing')}
  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
>
  <Crown className="w-4 h-4" />
  Upgrade to Pro
</button>
```

---

## Example 8: Pricing Card Icon (PricingCard.jsx)

### BEFORE:
```jsx
<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
  plan.tier === 'premium' 
    ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
    : 'bg-gradient-to-br from-brand-500 to-violet-500'
}`}>
  <span className="text-white">{icons[plan.tier]}</span>
</div>
```

### AFTER:
```jsx
<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
  plan.tier === 'premium' 
    ? 'bg-amber-400' 
    : 'bg-brand-500'
}`}>
  <span className="text-white">{icons[plan.tier]}</span>
</div>
```

---

## Example 9: Quiz Results Feedback (QuizResults.jsx)

### BEFORE:
```jsx
<div className="card p-8 mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-500 relative overflow-hidden">
  {/* content */}
</div>
```

### AFTER:
```jsx
<div className="card p-8 mb-8 bg-amber-50 border-2 border-amber-500 relative overflow-hidden">
  {/* content */}
</div>
```

---

## Example 10: Landing Page Demo Answer (Landing.jsx)

### BEFORE:
```jsx
{
  demoPhase === 3 && i === 1
    ? 'border-brand-500 bg-gradient-to-r from-blue-50 to-brand-50 text-brand-600 demo-correct shadow-xl'
    : 'border-border/60 bg-white hover:bg-surface text-slate'
}
```

### AFTER:
```jsx
{
  demoPhase === 3 && i === 1
    ? 'border-brand-500 bg-blue-50 text-brand-600 demo-correct shadow-xl'
    : 'border-border/60 bg-white hover:bg-surface text-slate'
}
```

---

## Color Palette Summary

### Primary Action Color
- Used for: Main buttons, primary icons, branding
- Color: `bg-brand-500` (previously `from-brand-500 to-violet-500`)

### Premium/Subscription Color  
- Used for: Pro/Premium badges, premium features
- Color: `bg-amber-400` (previously `from-amber-400 to-orange-500`)

### Light Backgrounds
- Used for: Page backgrounds, card backgrounds
- Color: `bg-gray-50` (previously `from-slate-50 to-slate-100` or `from-slate-50 to-surface`)

### Highlight Colors
- Correct answers: `bg-blue-50` (previously `from-blue-50 to-brand-50`)
- Hover states: `bg-green-50` (previously `from-green-50 to-white`)
- Feedback: `bg-amber-50` (previously `from-amber-50 to-orange-50`)

### Text Colors
- Logo/Branding: `text-brand-500` (previously `gradient-text`)

---

## Summary Statistics

- **Total Gradient Patterns Removed**: 26
- **Total Files Modified**: 12
- **Largest File**: Landing.jsx (10 replacements)
- **Average Replacements per File**: 2.17
- **Result**: 100% gradient-free, Duolingo-style design achieved
