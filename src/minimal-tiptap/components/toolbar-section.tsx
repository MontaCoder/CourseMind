import * as React from 'react'
import type { Editor } from '@tiptap/react'
import type { FormatAction } from '../types'
import type { VariantProps } from 'class-variance-authority'
import type { toggleVariants } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ToolbarButton } from './toolbar-button'
import { ShortcutKey } from './shortcut-key'
import { getShortcutKey } from '../utils'

interface ToolbarSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor
  actions: FormatAction[]
  activeActions?: string[]
  mainActionCount?: number
  dropdownIcon?: React.ReactNode
  dropdownTooltip?: string
  dropdownClassName?: string
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  editor,
  actions,
  activeActions = actions.map(action => action.value),
  mainActionCount = 0,
  dropdownIcon,
  dropdownTooltip = 'More options',
  dropdownClassName = 'w-12',
  size,
  variant
}) => {
  const { mainActions, dropdownActions } = React.useMemo(() => {
    const sortedActions = actions
      .filter(action => activeActions.includes(action.value))
      .sort((a, b) => activeActions.indexOf(a.value) - activeActions.indexOf(b.value))

    return {
      mainActions: sortedActions.slice(0, mainActionCount),
      dropdownActions: sortedActions.slice(mainActionCount)
    }
  }, [actions, activeActions, mainActionCount])

  const canExecuteAction = React.useCallback(
    (action: FormatAction) => {
      if (!editor || editor.isDestroyed || !editor.state) return false
      try {
        return action.canExecute(editor)
      } catch {
        return false
      }
    },
    [editor]
  )

  const isActionActive = React.useCallback(
    (action: FormatAction) => {
      if (!editor || editor.isDestroyed || !editor.state) return false
      try {
        return action.isActive(editor)
      } catch {
        return false
      }
    },
    [editor]
  )

  const runAction = React.useCallback(
    (action: FormatAction) => {
      if (!editor || editor.isDestroyed || !editor.state) return
      action.action(editor)
    },
    [editor]
  )

  const renderToolbarButton = React.useCallback(
    (action: FormatAction) => (
      <ToolbarButton
        key={action.label}
        onClick={() => runAction(action)}
        disabled={!canExecuteAction(action)}
        isActive={isActionActive(action)}
        tooltip={`${action.label} ${action.shortcuts.map(s => getShortcutKey(s).symbol).join(' ')}`}
        aria-label={action.label}
        size={size}
        variant={variant}
      >
        {action.icon}
      </ToolbarButton>
    ),
    [canExecuteAction, isActionActive, runAction, size, variant]
  )

  const renderDropdownMenuItem = React.useCallback(
    (action: FormatAction) => (
      <DropdownMenuItem
        key={action.label}
        onClick={() => runAction(action)}
        disabled={!canExecuteAction(action)}
        className={cn('flex flex-row items-center justify-between gap-4', {
          'bg-accent': isActionActive(action)
        })}
        aria-label={action.label}
      >
        <span className="grow">{action.label}</span>
        <ShortcutKey keys={action.shortcuts} />
      </DropdownMenuItem>
    ),
    [canExecuteAction, isActionActive, runAction]
  )

  const isDropdownActive = React.useMemo(
    () => dropdownActions.some(isActionActive),
    [dropdownActions, isActionActive]
  )

  return (
    <>
      {mainActions.map(renderToolbarButton)}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              isActive={isDropdownActive}
              tooltip={dropdownTooltip}
              aria-label={dropdownTooltip}
              className={cn(dropdownClassName)}
              size={size}
              variant={variant}
            >
              {dropdownIcon || <CaretDownIcon className="size-5" />}
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full">
            {dropdownActions.map(renderDropdownMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}

export default ToolbarSection
