CREATE TABLE bookmarks_table(
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(2,1) NOT NULL
);