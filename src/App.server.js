/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Suspense } from 'react';

import Note from './Note.server';
import NoteList from './NoteList.server';
import EditButton from './EditButton.client';
import SearchField from './SearchField.client';
import NoteSkeleton from './NoteSkeleton';
import NoteListSkeleton from './NoteListSkeleton';

import { Logout, StaticWebAuthLogins } from "@aaronpowell/react-static-web-apps-auth";

export default function App({ selectedId, isEditing, searchText, userInfo }) {

  return (
    <div className="main">
      <section className="col sidebar">
        <section className="sidebar-header">
          <img
            className="logo"
            src="logo.svg"
            width="22px"
            height="20px"
            alt=""
            role="presentation"
          />
          <strong>React Notes</strong>
        </section>
        { userInfo &&
          <>
            <section className="sidebar-login" role="menubar">
              {userInfo.userDetails} | <Logout />
            </section>
            <section className="sidebar-menu" role="menubar">
              <SearchField />
              <EditButton noteId={null}>New</EditButton>
            </section>
            <nav>
              <Suspense fallback={<NoteListSkeleton />}>
                <NoteList searchText={searchText} userInfo={userInfo} />
              </Suspense>
            </nav>
          </>
        }
      </section>
      {
        userInfo
          ? <section key={selectedId} className="col note-viewer">
              <Suspense fallback={<NoteSkeleton isEditing={isEditing} />}>
                <Note selectedId={selectedId} isEditing={isEditing} userInfo={userInfo} />
              </Suspense>
            </section>
          : <section key={selectedId} className="col login-pane">
              <p>
                Welcome to the a demo of React Server Components running on
                <a href="https://docs.microsoft.com/en-us/azure/static-web-apps/overview">Azure Static Web Apps</a>.
                <br />&nbsp;
              </p>
              <p>
                To view and edit notes, log in with one of these providers: <br />&nbsp;
              </p>
              <StaticWebAuthLogins />
            </section>
      }
    </div>
  );
}
