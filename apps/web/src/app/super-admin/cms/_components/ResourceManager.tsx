'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Inbox,
  RefreshCw,
  Check,
  X as XIcon,
  Star,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ColumnDef, ResourceConfig } from '@/lib/cms/resources';
import { cms } from '@/lib/cms/client';
import { ResourceForm } from './ResourceForm';
import { CourseEditorForm } from './CourseEditorForm';

type Item = Record<string, unknown>;

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Item | null>(null);

  const bodyKey = useMemo(
    () => (config.fields.some((f) => f.name === 'slug') ? 'slug' : 'id'),
    [config],
  );

  const idOf = useCallback(
    (item: Item) => String(item.id ?? item.slug ?? ''),
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cms.list<Item[]>(config.key);
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data);
      setDemo(false);
    } else if (config.sample && config.sample.length > 0) {
      setItems(config.sample as Item[]);
      setDemo(true);
    } else {
      setItems([]);
      setDemo(false);
      if (!res.ok && res.error) {
        toast.error(res.error);
      }
    }
    setLoading(false);
  }, [config]);


  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) =>
      config.columns.some((c) => String(it[c.name] ?? '').toLowerCase().includes(q)),
    );
  }, [items, query, config]);

  async function handleSubmit(payload: Item) {
    setSubmitting(true);
    const res = editing
      ? await cms.update(config.key, idOf(editing), payload)
      : await cms.create(config.key, payload);
    setSubmitting(false);

    if (res.ok) {
      toast.success(`${config.label} ${editing ? 'updated' : 'created'}`);
      setFormOpen(false);
      setEditing(null);
      load();
    } else {
      toast.error(res.error || `Failed to save ${config.label.toLowerCase()}`);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const res = await cms.remove(config.key, idOf(target));
    if (res.ok) {
      toast.success(`${config.label} moved to recycle bin`);
      setItems((prev) => prev.filter((it) => idOf(it) !== idOf(target)));
    } else {
      toast.error(res.error || 'Delete failed');
    }
  }

  async function togglePublish(item: Item, next: boolean) {
    if (!config.publishField) return;
    const field = config.publishField;
    // optimistic
    setItems((prev) => prev.map((it) => (idOf(it) === idOf(item) ? { ...it, [field]: next } : it)));

    const payload: Item =
      config.backend.updateMode === 'upsert'
        ? { id: idOf(item), [bodyKey]: item[bodyKey], [field]: next }
        : { [field]: next };

    const res = await cms.update(config.key, idOf(item), payload);
    if (res.ok) {
      toast.success(next ? 'Published' : 'Unpublished');
    } else {
      toast.error(res.error || 'Update failed');
      setItems((prev) =>
        prev.map((it) => (idOf(it) === idOf(item) ? { ...it, [field]: !next } : it)),
      );
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(item: Item) {
    setEditing(item);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-foreground">{config.labelPlural}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{config.description}</p>
        </div>
        {config.canCreate && (
          <Button onClick={openCreate} className="self-start sm:self-auto">
            <Plus className="size-4" /> New {config.label}
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.labelPlural.toLowerCase()}…`}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {demo && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="size-4 shrink-0" />
          Showing sample data — the API is unreachable or you are not signed in as an admin. Changes
          won&apos;t persist.
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState label={config.labelPlural} onCreate={config.canCreate ? openCreate : undefined} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-(--color-surface) overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground uppercase text-xs tracking-widest">
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.name} className="px-5 py-3 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={idOf(item)}
                    className="border-b border-border last:border-0 hover:bg-background/40 transition-colors"
                  >
                    {config.columns.map((c) => (
                      <td key={c.name} className="px-5 py-3 align-middle">
                        <Cell item={item} col={c} config={config} onToggle={togglePublish} />
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <RowActions
                        canEdit={config.canEdit}
                        canDelete={config.canDelete}
                        previewUrl={config.key === 'blog' ? `/blog/${item.slug}${item.previewToken ? `?preview=${item.previewToken}` : ''}` : undefined}
                        onEdit={() => openEdit(item)}
                        onDelete={() => setDeleting(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => {
              const primary = config.columns.find((c) => c.primary) || config.columns[0];
              const rest = config.columns.filter((c) => c !== primary);
              return (
                <div
                  key={idOf(item)}
                  className="rounded-xl border border-border bg-(--color-surface) p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {String(item[primary.name] ?? '—')}
                      </p>
                    </div>
                    <RowActions
                      canEdit={config.canEdit}
                      canDelete={config.canDelete}
                      previewUrl={config.key === 'blog' ? `/blog/${item.slug}${item.previewToken ? `?preview=${item.previewToken}` : ''}` : undefined}
                      onEdit={() => openEdit(item)}
                      onDelete={() => setDeleting(item)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {rest.map((c) => (
                      <div key={c.name} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="uppercase tracking-wider">{c.label}:</span>
                        <Cell item={item} col={c} config={config} onToggle={togglePublish} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }}>
        <DialogContent
          data-lenis-prevent
          className={config.key === 'courses' ? 'max-w-5xl' : 'max-w-2xl'}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${config.label}` : `New ${config.label}`}
            </DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>
          {config.key === 'courses' ? (
            <CourseEditorForm
              initial={editing}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => { setFormOpen(false); setEditing(null); }}
            />
          ) : (
            <ResourceForm
              config={config}
              initial={editing}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => { setFormOpen(false); setEditing(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {config.label.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be moved to the recycle bin and hidden from the public site. You can restore it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RowActions({
  canEdit,
  canDelete,
  previewUrl,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  previewUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {previewUrl && (
        <Button variant="ghost" size="icon" asChild title="Preview Draft">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Eye className="size-4" />
          </a>
        </Button>
      )}
      {canEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
          <Pencil className="size-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

function Cell({
  item,
  col,
  config,
  onToggle,
}: {
  item: Item;
  col: ColumnDef;
  config: ResourceConfig;
  onToggle: (item: Item, next: boolean) => void;
}) {
  const value = item[col.name];

  if (col.type === 'boolean') {
    const on = Boolean(value);
    if (config.publishField === col.name && config.canEdit) {
      return <Switch checked={on} onCheckedChange={(c) => onToggle(item, c)} />;
    }
    return on ? (
      <Check className="size-4 text-green-500" />
    ) : (
      <XIcon className="size-4 text-muted-foreground" />
    );
  }

  if (col.type === 'rating') {
    const n = Number(value) || 0;
    return (
      <span className="inline-flex text-yellow-500">
        {Array.from({ length: Math.max(0, Math.min(5, n)) }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-current" />
        ))}
      </span>
    );
  }

  if (col.type === 'badge') {
    if (value === undefined || value === null || value === '') return <span className="text-muted-foreground">—</span>;
    return <Badge variant="secondary" className="capitalize">{String(value)}</Badge>;
  }

  if (col.type === 'image') {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={String(value)} alt="Preview" className="h-9 w-14 object-cover rounded" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  if (col.type === 'date') {
    if (!value) return <span className="text-muted-foreground">—</span>;
    const d = new Date(String(value));
    return <span>{Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()}</span>;
  }

  const text = value === undefined || value === null || value === '' ? '—' : String(value);
  return <span className={col.primary ? 'font-medium text-foreground' : ''}>{text}</span>;
}

function EmptyState({ label, onCreate }: { label: string; onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <Inbox className="size-10 text-muted-foreground" />
      <p className="text-muted-foreground">No {label.toLowerCase()} yet.</p>
      {onCreate && (
        <Button variant="outline" onClick={onCreate}>
          <Plus className="size-4" /> Create the first one
        </Button>
      )}
    </div>
  );
}
