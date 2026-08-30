"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Introduction from "../../components/docs/Introduction";
import Authentication from "../../components/docs/Authentication";
import RateLimits from "../../components/docs/RateLimits";
import EndpointsList from "../../components/docs/EndpointsList";
import DataModel from "../../components/docs/DataModel";
import FilteringPagination from "../../components/docs/FilteringPagination";
import ErrorHandling from "../../components/docs/ErrorHandling";
import BestPractices from "../../components/docs/BestPractices";
import CodeExamples from "../../components/docs/CodeExamples";
import {
  nav,
  endpoints,
  dataModel,
  errorCodes,
  commonErrors,
  bestPractices,
} from "../../libs/docsData";

export default function DocsPage() {
  const [active, setActive] = useState("introduction");

  useEffect(() => {
    const ids = nav.flatMap((s) => s.items.map((i) => i.id));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex gap-8 px-5 max-w-[1440px] mx-auto pt-8">
        <Sidebar active={active} />

        <main className="flex-1 min-w-0 py-4">
          <Introduction />
          <Authentication />
          <RateLimits />

          <EndpointsList endpoints={endpoints} />

          <DataModel dataModel={dataModel} />
          <FilteringPagination />
          <ErrorHandling errorCodes={errorCodes} commonErrors={commonErrors} />
          <BestPractices bestPractices={bestPractices} />
          <CodeExamples />
        </main>
      </div>
    </div>
  );
}
