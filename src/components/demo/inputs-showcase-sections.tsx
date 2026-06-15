"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { DEMO_SEARCH_ITEMS, type DemoSearchApiResponse } from "@/components/demo/data";
import API_ROUTES from "@/constants/api-routes.constants";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Typography } from "@/components/ui/typography";
import { useFetch } from "@/hooks/use-fetch";
import { silentFetcher } from "@/lib/swr-client";

function SearchFieldBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Typography variant="label2" as="p">
        {title}
      </Typography>
      {hint && (
        <Typography variant="caption2" as="p" color="muted">
          {hint}
        </Typography>
      )}
      {children}
    </div>
  );
}

function DebouncedSearchDemo() {
  const t = useTranslations("demo.forms");
  const [searchResult, setSearchResult] = React.useState("");

  return (
    <SearchFieldBlock title={t("searchInputTitle")} hint={t("searchInputHint")}>
      <SearchInput
        className="max-w-full"
        onSearch={setSearchResult}
        placeholder={t("searchInputPlaceholder")}
      />
      {searchResult && (
        <Typography variant="caption2" as="p" color="muted" className="mt-2">
          {t("searchInputResult", { query: searchResult })}
        </Typography>
      )}
    </SearchFieldBlock>
  );
}

function AutocompleteSearchDemo() {
  const t = useTranslations("demo.forms");
  const [value, setValue] = React.useState<string>();

  const options = React.useMemo(
    () =>
      DEMO_SEARCH_ITEMS.map((item) => ({
        value: item.id,
        label: t(item.labelKey),
      })),
    [t]
  );

  return (
    <SearchFieldBlock title={t("searchAutocompleteTitle")} hint={t("searchAutocompleteHint")}>
      <AutocompleteInput
        className="max-w-full"
        options={options}
        value={value}
        onValueChange={setValue}
        placeholder={t("searchAutocompletePlaceholder")}
        emptyLabel={t("searchAutocompleteEmpty")}
      />
      {value && (
        <Typography variant="caption2" as="p" color="muted" className="mt-2">
          {t("searchAutocompleteSelected", {
            label: options.find((option) => option.value === value)?.label ?? value,
          })}
        </Typography>
      )}
    </SearchFieldBlock>
  );
}

function SearchSimulationDemo() {
  const t = useTranslations("demo.forms");
  const [query, setQuery] = React.useState("");

  const searchUrl =
    query.length >= 2 ? `${API_ROUTES.DEMO.SEARCH}?q=${encodeURIComponent(query)}` : null;

  const { data, isLoading } = useFetch<DemoSearchApiResponse>(searchUrl, {
    fetcher: silentFetcher,
  });

  const showResults = query.length >= 2 && !isLoading;

  return (
    <SearchFieldBlock title={t("searchSimulationTitle")} hint={t("searchSimulationHint")}>
      <SearchInput
        className="max-w-full"
        onSearch={setQuery}
        placeholder={t("searchSimulationPlaceholder")}
        debounceMs={300}
        loading={Boolean(isLoading && query.trim().length >= 2)}
      />

      {showResults && (
        <div className="mt-3">
          {data?.items.length ? (
            <ul className="border-border divide-border max-h-48 divide-y overflow-y-auto rounded-md border">
              {data.items.map((item) => (
                <li key={item.id} className="px-3 py-2">
                  <Typography variant="caption1" as="p" className="text-foreground">
                    {t(item.labelKey)}
                  </Typography>
                  <Typography variant="caption2" as="p" color="muted">
                    {t(item.categoryKey)}
                  </Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="caption2" as="p" color="muted">
              {t("searchSimulationEmpty")}
            </Typography>
          )}
        </div>
      )}
    </SearchFieldBlock>
  );
}

export function InputsSearchSection() {
  const t = useTranslations("demo.forms");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("searchSectionTitle")}</CardTitle>
        <CardDescription>
          <Typography variant="caption1" as="span" color="muted">
            {t("searchSectionHint")}
          </Typography>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DebouncedSearchDemo />
        <AutocompleteSearchDemo />
        <SearchSimulationDemo />
      </CardContent>
    </Card>
  );
}
