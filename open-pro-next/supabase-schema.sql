-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists projects (
  id text primary key,
  template_slug text not null,
  file_content text,
  version integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_history (
  id bigint generated always as identity primary key,
  project_id text references projects(id) on delete cascade,
  file_path text not null,
  before_content text not null,
  after_content text not null,
  direction text not null default 'undo',
  created_at timestamptz default now()
);

create index if not exists idx_project_history_project_id on project_history(project_id);
