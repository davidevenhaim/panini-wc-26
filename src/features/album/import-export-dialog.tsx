"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { toastError, toastSuccess } from "@/lib/toast";
import { CollectionImportError, validateImport } from "@/lib/album/collection";
import { useCollectionStore } from "@/store/collection.store";
import { exportDuplicatesCsv, exportExcel, exportJson, exportMissingTxt } from "./exporters";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportExportDialog({ open, onOpenChange }: Props) {
  const t = useTranslations();
  const quantities = useCollectionStore((s) => s.quantities);
  const replaceAll = useCollectionStore((s) => s.replaceAll);
  const [pasted, setPasted] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const runExport = (fn: () => void) => () => {
    fn();
    toastSuccess(t("album.importExport.exported"));
  };

  const importFromText = (text: string) => {
    try {
      const parsed = JSON.parse(text) as unknown;
      const sanitized = validateImport(parsed);
      replaceAll(sanitized);
      toastSuccess(t("album.importExport.imported"));
      setPasted("");
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof CollectionImportError ? err.message : t("album.importExport.invalidJson");
      toastError(t("album.importExport.invalidJson"), msg);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importFromText(text);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("album.importExport.title")}</DialogTitle>
          <DialogDescription>{t("album.importExport.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={runExport(() => exportExcel(quantities))}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Iconify icon="lucide:file-spreadsheet" className="size-4" />
              {t("album.importExport.exportExcel")}
            </Button>
            <Button variant="outline" size="sm" onClick={runExport(() => exportJson(quantities))}>
              <Iconify icon="lucide:download" className="size-4" />
              {t("album.importExport.exportJson")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runExport(() => exportMissingTxt(quantities))}
            >
              <Iconify icon="lucide:square-dashed" className="size-4" />
              {t("album.importExport.exportMissingTxt")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runExport(() => exportDuplicatesCsv(quantities))}
            >
              <Iconify icon="lucide:copy" className="size-4" />
              {t("album.importExport.exportDuplicatesCsv")}
            </Button>
          </div>

          <div className="space-y-2">
            <Typography variant="label2" as="label" className="block font-semibold">
              {t("album.importExport.importJson")}
            </Typography>
            <Typography variant="caption2" as="p" color="muted">
              {t("album.importExport.importHelper")}
            </Typography>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={t("album.importExport.importPlaceholder")}
              rows={5}
              className="bg-card focus-visible:ring-ring/40 w-full rounded-2xl border p-3 font-mono text-xs outline-none focus-visible:ring-2"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!pasted.trim()} onClick={() => importFromText(pasted)}>
                <Iconify icon="lucide:upload" className="size-4" />
                {t("album.importExport.importJson")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Iconify icon="lucide:file-up" className="size-4" />
                {t("album.importExport.uploadFile")}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
