# Frontend Styling Guide

This guide ensures consistent, accessible styling across the app with proper dark mode support.

## Semantic Tokens Reference

Always use semantic tokens instead of hardcoded Chakra colors. These tokens automatically adapt to light/dark mode.

### Text Colors

- **`text.primary`** - Main headings, body text, and primary content
- **`text.secondary`** - Descriptions, captions, labels, and secondary information
- **`text.muted`** - Disabled states, placeholder text
- **`text.button`** - Text on colored buttons

### Background Colors

- **`bg.primary`** - Main dark background (e.g., table headers, page background)
- **`bg.secondary`** - Cards, containers, sections, input fields
- **`bg.overlay`** - Highlighted/selected states (e.g., current user's row)

### Border Colors

- **`border.default`** - Standard borders for cards, tables, containers
- **`border.accent`** - Emphasized borders

### Brand Colors

- **`brand.primary`** - Primary brand color (orange)
- **`brand.secondary`** - Secondary brand color
- **`brand.accent`** - Accent color

## Forbidden Patterns

These patterns cause visibility issues in dark mode and should NEVER be used:

### ❌ Hardcoded Gray Colors

```tsx
// ❌ WRONG - Invisible in dark mode
<Text color="gray.400">Secondary text</Text>
<Text color="gray.500">Description</Text>
<Text color="gray.600">Label</Text>

// ✅ CORRECT - Theme-aware
<Text color="text.secondary">Secondary text</Text>
```

### ❌ White Backgrounds

```tsx
// ❌ WRONG - Jarring white flash in dark mode
<Box bg="white">
  <Input bg="white" />
</Box>

// ✅ CORRECT - Adapts to theme
<Box bg="bg.secondary">
  <Input bg="bg.secondary" />
</Box>
```

### ❌ Light Color Backgrounds for Emphasis

```tsx
// ❌ WRONG - Light text on light background
<Box bg="orange.50">
  <Text color="gray.700">Content</Text>
</Box>

// ✅ CORRECT - Border-based emphasis
<Box
  bg="bg.secondary"
  borderWidth="2px"
  borderColor="brand.primary"
>
  <Text color="text.secondary">Content</Text>
</Box>
```

### ❌ Light Backgrounds for Table Row Highlighting

```tsx
// ❌ WRONG - Invisible in dark mode
<Tr bg={isCurrentUser ? 'orange.50' : undefined}>

// ✅ CORRECT - Border-based highlighting
<Tr
  bg={isCurrentUser ? 'bg.overlay' : undefined}
  borderLeftWidth={isCurrentUser ? '4px' : '0'}
  borderLeftColor={isCurrentUser ? 'brand.primary' : undefined}
>
```

## Correct Patterns

### ✅ Text Styling

```tsx
// Primary text
<Heading color="text.primary">Main Title</Heading>
<Text color="text.primary">Body content</Text>

// Secondary text (descriptions, labels)
<Text color="text.secondary">Description text</Text>
<FormLabel color="text.secondary">Field Label</FormLabel>

// Muted text (placeholders, disabled)
<Text color="text.muted">Placeholder</Text>
```

### ✅ Container Backgrounds

```tsx
// Cards and sections
<Box
  p={6}
  borderRadius="24px"
  borderWidth="1px"
  borderColor="border.default"
  bg="bg.secondary"
>
  <Heading>Content</Heading>
</Box>

// Form inputs
<Input bg="bg.secondary" borderRadius="12px" />
<Select bg="bg.secondary" borderRadius="12px" />
```

### ✅ Tables with Semantic Tokens

```tsx
<Box
  borderRadius="24px"
  overflow="hidden"
  borderWidth="1px"
  borderColor="border.default"
  bg="bg.secondary"
>
  <Table variant="simple">
    <Thead bg="bg.primary">
      <Tr>
        <Th>Column Header</Th>
      </Tr>
    </Thead>
    <Tbody>
      <Tr>
        <Td>Data</Td>
      </Tr>
    </Tbody>
  </Table>
</Box>
```

### ✅ Highlighted Table Rows (Current User)

```tsx
<Tr
  bg={isCurrentUser ? 'bg.overlay' : undefined}
  borderLeftWidth={isCurrentUser ? '4px' : '0'}
  borderLeftColor={isCurrentUser ? 'brand.primary' : undefined}
  fontWeight={isCurrentUser ? 'semibold' : 'normal'}
>
  <Td>Team Name</Td>
</Tr>
```

### ✅ Emphasized Section (Instead of Light Background)

```tsx
// Use borders to emphasize, not light backgrounds
<Box
  p={6}
  borderRadius="24px"
  borderWidth="2px"
  borderColor="brand.primary"
  bg="bg.secondary"
>
  <Heading size="md">Important Section</Heading>
  <Text color="text.secondary">Description</Text>
</Box>
```

### ✅ Alert Components

Alert components now have theme overrides, but you can still add explicit colors:

```tsx
<Alert status="error" borderRadius="24px">
  <AlertIcon />
  <AlertDescription color="text.primary">
    Error message text
  </AlertDescription>
</Alert>

<Alert status="warning" borderRadius="16px">
  <AlertIcon />
  <AlertDescription>
    Warning message (inherits theme colors)
  </AlertDescription>
</Alert>
```

### ✅ Status Colors

For status-specific colors (success, error, warning), you can still use specific color values:

```tsx
// Success/Error states - these are semantic
<Text color="green.500">Success message</Text>
<Text color="red.500">Error message</Text>
<Badge colorScheme="green">Active</Badge>
<Badge colorScheme="red">Eliminated</Badge>

// But still use semantic tokens for neutral content
<Text color="text.secondary">Supporting text</Text>
```

## Component Examples

### Card with Form

```tsx
<Box p={6} borderRadius="24px" borderWidth="1px" borderColor="border.default" bg="bg.secondary">
  <VStack align="stretch" gap={4}>
    <Heading size="md" color="text.primary">
      Form Title
    </Heading>
    <Text fontSize="sm" color="text.secondary">
      Form description or instructions
    </Text>

    <FormControl>
      <FormLabel color="text.primary">Field Label</FormLabel>
      <Input bg="bg.secondary" borderRadius="12px" />
      <Text fontSize="sm" color="text.secondary" mt={2}>
        Helper text
      </Text>
    </FormControl>
  </VStack>
</Box>
```

### Standings Table

```tsx
<Box
  borderRadius="24px"
  overflow="hidden"
  borderWidth="1px"
  borderColor="border.default"
  bg="bg.secondary"
>
  <Table variant="simple">
    <Thead bg="bg.primary">
      <Tr>
        <Th>Rank</Th>
        <Th>Team</Th>
        <Th isNumeric>Points</Th>
      </Tr>
    </Thead>
    <Tbody>
      {teams.map((team) => (
        <Tr
          key={team.id}
          bg={team.isCurrentUser ? 'bg.overlay' : undefined}
          borderLeftWidth={team.isCurrentUser ? '4px' : '0'}
          borderLeftColor={team.isCurrentUser ? 'brand.primary' : undefined}
        >
          <Td>{team.rank}</Td>
          <Td fontWeight={team.isCurrentUser ? 'semibold' : 'normal'}>
            {team.name}
          </Td>
          <Td isNumeric>{team.points}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
</Box>
```

### Member List with Status Badges

```tsx
<VStack align="stretch" gap={2}>
  {members.map((member) => (
    <HStack
      key={member.id}
      justify="space-between"
      p={2}
      borderRadius="md"
      bg="bg.secondary"
    >
      <VStack align="start" gap={0}>
        <HStack gap={2}>
          <Text fontWeight="bold" color="text.primary">
            {member.name}
          </Text>
          <Badge colorScheme={member.isOwner ? 'purple' : 'blue'}>
            {member.role}
          </Badge>
        </HStack>
        {member.email && (
          <Text fontSize="sm" color="text.secondary">
            {member.email}
          </Text>
        )}
      </VStack>
    </HStack>
  ))}
</VStack>
```

## Migration Checklist

When reviewing or updating components, check for:

- [ ] No `color="gray.*"` (use `color="text.secondary"`)
- [ ] No `bg="white"` (use `bg="bg.secondary"`)
- [ ] No `bg="orange.50"` for emphasis (use border-based highlighting)
- [ ] Table headers use `bg="bg.primary"`
- [ ] Table containers use `borderColor="border.default"`
- [ ] Highlighted rows use left border, not background color
- [ ] Alert components have explicit text colors if needed
- [ ] Form inputs use `bg="bg.secondary"`

## Testing

After making styling changes:

1. **Test in dark mode** - All text should be clearly visible
2. **Check contrast ratios** - Use browser DevTools to verify WCAG AA compliance (4.5:1 for normal text)
3. **Verify semantic token usage** - No hardcoded gray/white values
4. **Test highlighted states** - Current user rows should be clearly distinguishable

## Questions?

If you're unsure which semantic token to use:
- For text that's not the main focus → `text.secondary`
- For backgrounds that aren't the page background → `bg.secondary`
- For borders on cards/tables → `border.default`
- For emphasis → Use borders with `brand.primary`, not light backgrounds
