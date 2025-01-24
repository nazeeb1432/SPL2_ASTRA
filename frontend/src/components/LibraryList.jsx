// components/LibraryList.jsx
import LibraryItem from "./LibraryItem";

const LibraryList = ({ items, viewMode }) => {
  return (
    <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-col space-y-3"}>
      {items.length ? (
        items.map((item) => <LibraryItem key={item.id} data={item} viewMode={viewMode} />)
      ) : (
        <p className="text-gray-600">No items found.</p>
      )}
    </div>
  );
};

export default LibraryList;
