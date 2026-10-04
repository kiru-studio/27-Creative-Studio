"use client";

import { upload } from "@vercel/blob/client";
import { ArrowDown, ArrowUp, Eye, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { siteContent } from "@/lib/site-content";

type EditableValue =
  | string
  | number
  | boolean
  | null
  | EditableValue[]
  | { [key: string]: EditableValue };

const adminCopy = siteContent.adminCopy;

function labelFor(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function itemName(value: EditableValue, index: number) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of ["title", "name", "question", "label"]) {
      const candidate = value[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }
  return `Item ${index + 1}`;
}

function replaceAtPath(
  root: EditableValue,
  path: (string | number)[],
  value: EditableValue,
  index = 0,
): EditableValue {
  const key = path[index];
  if (key === undefined) return value;
  const clone = Array.isArray(root) ? [...root] : { ...(root as Record<string, EditableValue>) };
  const current = Array.isArray(clone) ? clone[Number(key)] : clone[String(key)];
  const updated =
    index === path.length - 1
      ? value
      : replaceAtPath(current, path, value, index + 1);
  if (Array.isArray(clone)) clone[Number(key)] = updated;
  else clone[String(key)] = updated;
  return clone;
}

function ContentField({
  name,
  value,
  path,
  onChange,
  onUpload,
  uploadPath,
}: {
  name: string;
  value: EditableValue;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: EditableValue) => void;
  onUpload: (path: (string | number)[], file: File, video: boolean) => void;
  uploadPath: string | null;
}) {
  const label = labelFor(name);
  const pathKey = path.join(".");

  if (Array.isArray(value)) {
    const template = value[0];
    const maxItems = path.length === 1 && path[0] === "reels" ? 8 : 100;
    const addItem = () => {
      if (template === undefined || value.length >= maxItems) return;
      onChange(path, [...value, structuredClone(template)]);
    };
    const moveItem = (index: number, offset: number) => {
      const target = index + offset;
      if (target < 0 || target >= value.length) return;
      const next = [...value];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(path, next);
    };
    return (
      <fieldset className="admin-array">
        <legend>{label}</legend>
        <div className="admin-array-items">
          {value.map((item, index) => (
            <details className="admin-item" key={`${pathKey}-${index}`}>
              <summary>
                <span>{itemName(item, index)}</span>
              </summary>
              <div className="admin-item-actions">
                <button className="admin-icon-button" type="button" aria-label={adminCopy.moveUp} disabled={index === 0} onClick={() => moveItem(index, -1)}>
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button className="admin-icon-button" type="button" aria-label={adminCopy.moveDown} disabled={index === value.length - 1} onClick={() => moveItem(index, 1)}>
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  className="admin-icon-button admin-remove"
                  type="button"
                  aria-label={`${adminCopy.removeItem}: ${itemName(item, index)}`}
                  disabled={value.length <= 1}
                  onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="admin-item-fields">
                <ContentField
                  name={String(index)}
                  value={item}
                  path={[...path, index]}
                  onChange={onChange}
                  onUpload={onUpload}
                  uploadPath={uploadPath}
                />
              </div>
            </details>
          ))}
          {value.length === 0 && <p className="admin-help">{adminCopy.emptyList}</p>}
          <button
            className="admin-add-button"
            type="button"
            onClick={addItem}
            disabled={template === undefined || value.length >= maxItems}
          >
            <Plus size={16} aria-hidden="true" /> {adminCopy.addItem}
          </button>
          {path.length === 1 && path[0] === "reels" && (
            <p className="admin-help">{adminCopy.reelLimit}</p>
          )}
        </div>
      </fieldset>
    );
  }

  if (value && typeof value === "object") {
    return (
      <fieldset className="admin-object">
        <legend>{label}</legend>
        <div className="admin-object-fields">
          {Object.entries(value).map(([childName, childValue]) => (
            <ContentField
              key={`${pathKey}.${childName}`}
              name={childName}
              value={childValue}
              path={[...path, childName]}
              onChange={onChange}
              onUpload={onUpload}
              uploadPath={uploadPath}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="admin-toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
        <span>{label}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="admin-field">
        <span>{label}</span>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(path, Number(event.target.value))}
        />
      </label>
    );
  }

  const textValue = typeof value === "string" ? value : "";
  const mediaField = /(?:src|image|favicon)$/i.test(name);
  const videoField = /video/i.test(name);
  const longText =
    textValue.length > 100 ||
    /body|description|bio|quote|answer|goal|shot|result|message/i.test(name);

  return (
    <div className="admin-field">
      <label htmlFor={`field-${pathKey}`}>
        <span>{label}</span>
      </label>
      {longText ? (
        <textarea
          id={`field-${pathKey}`}
          value={textValue}
          rows={3}
          onChange={(event) => onChange(path, event.target.value)}
        />
      ) : (
        <input
          id={`field-${pathKey}`}
          type="text"
          value={textValue}
          onChange={(event) => onChange(path, event.target.value)}
        />
      )}
      {mediaField && (
        <div className="admin-media-control">
          <label className="admin-upload-button">
            <Upload size={16} aria-hidden="true" />
            {uploadPath === pathKey ? adminCopy.uploading : adminCopy.uploadMedia}
            <input
              type="file"
              accept={videoField ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/avif"}
              disabled={uploadPath === pathKey}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(path, file, videoField);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {textValue && (
            <>
              <a href={textValue} target="_blank" rel="noreferrer">
                {adminCopy.assetPreview}
              </a>
              <div className="admin-asset-preview">
                {videoField ? (
                  <video src={textValue} controls muted playsInline preload="none" />
                ) : (
                  <img src={textValue} alt="" />
                )}
              </div>
            </>
          )}
          <p className="admin-help">{adminCopy.uploadHint}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [content, setContent] = useState<EditableValue | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadPath, setUploadPath] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (!response.ok) {
      if (response.status !== 401) setError(adminCopy.loadError);
      return false;
    }
    setContent((await response.json()) as EditableValue);
    return true;
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        const session = (await response.json()) as {
          authenticated: boolean;
          configured: boolean;
        };
        if (!active) return;
        if (!session.configured) setError(adminCopy.setupRequired);
        if (session.authenticated) await loadContent();
      })
      .catch(() => {
        if (active) setError(adminCopy.loadError);
      });
    return () => {
      active = false;
    };
  }, [loadContent]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error || adminCopy.loginError);
        return;
      }
      setPassword("");
      if (!(await loadContent())) setError(adminCopy.loadError);
    } catch {
      setError(adminCopy.loginError);
    } finally {
      setBusy(false);
    }
  };

  const updateContent = (path: (string | number)[], value: EditableValue) => {
    setContent((current) => (current ? replaceAtPath(current, path, value) : current));
    setDirty(true);
    setMessage("");
  };

  const uploadMedia = async (
    path: (string | number)[],
    file: File,
    video: boolean,
  ) => {
    const pathKey = path.join(".");
    setUploadPath(pathKey);
    setError("");
    try {
      if (video !== file.type.startsWith("video/")) {
        setError(adminCopy.mediaTypeError);
        return;
      }
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/media",
      });
      updateContent(path, blob.url);
    } catch {
      setError(adminCopy.mediaError);
    } finally {
      setUploadPath(null);
    }
  };

  const publish = async () => {
    if (!content) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        setError(result.error || adminCopy.publishError);
        return;
      }
      setDirty(false);
      setMessage(result.message || adminCopy.saved);
    } catch {
      setError(adminCopy.publishError);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setDirty(false);
    setMessage("");
    setError("");
  };

  if (!content) {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <a className="admin-brand" href="/">rec <span>mode</span></a>
          <p className="kicker">{siteContent.brand.name} / {siteContent.brand.descriptor}</p>
          <h1>{adminCopy.loginTitle}</h1>
          <form onSubmit={signIn}>
            <label className="admin-field" htmlFor="admin-password">
              <span>{adminCopy.passwordLabel}</span>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? adminCopy.publishing : adminCopy.signIn}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const contentObject = content as Record<string, EditableValue>;
  const sections = Object.keys(contentObject);
  const sectionContent = contentObject[activeSection];

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <a className="admin-brand" href="/">rec <span>mode</span></a>
          <p>{adminCopy.title}</p>
        </div>
        <div className="admin-header-actions">
          <a className="admin-secondary" href="/" target="_blank" rel="noreferrer">
            <Eye size={16} aria-hidden="true" /> {adminCopy.preview}
          </a>
          <button className="admin-secondary" type="button" onClick={signOut}>
            <LogOut size={16} aria-hidden="true" /> {adminCopy.signOut}
          </button>
        </div>
      </header>
      <div className="admin-main">
        <div className="admin-page-title">
          <div>
            <p className="kicker">{siteContent.brand.name} / {siteContent.brand.descriptor}</p>
            <h1>{adminCopy.title}</h1>
            <p>{adminCopy.intro}</p>
          </div>
          <button
            className="button button-primary admin-publish"
            type="button"
            onClick={publish}
            disabled={busy || !dirty}
          >
            <Save size={16} aria-hidden="true" />
            {busy ? adminCopy.publishing : adminCopy.publish}
          </button>
        </div>
        <p className="admin-preview-note">{adminCopy.sitePreview}</p>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {message && <p className="admin-success" role="status">{message}</p>}
        <div className="admin-workspace">
          <nav className="admin-sections" aria-label={adminCopy.sections}>
            <span>{adminCopy.sections}</span>
            {sections.map((section) => (
              <button
                key={section}
                className={activeSection === section ? "active" : ""}
                type="button"
                onClick={() => setActiveSection(section)}
              >
                {labelFor(section)}
              </button>
            ))}
          </nav>
          <section className="admin-editor" aria-label={labelFor(activeSection)}>
            <h2>{labelFor(activeSection)}</h2>
            {sectionContent !== undefined && (
              <ContentField
                name={activeSection}
                value={sectionContent}
                path={[activeSection]}
                onChange={updateContent}
                onUpload={uploadMedia}
                uploadPath={uploadPath}
              />
            )}
            <div className="admin-bottom-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={publish}
                disabled={busy || !dirty}
              >
                <Save size={16} aria-hidden="true" />
                {busy ? adminCopy.publishing : adminCopy.publish}
              </button>
              {dirty && <span className="admin-dirty">{adminCopy.dirty}</span>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}