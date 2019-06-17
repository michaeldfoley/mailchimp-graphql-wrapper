import DataLoader from "dataloader";
import { getList } from "./mailchimp";

const cacheMap = new Map();

const interestLoader = new DataLoader(
  keys => Promise.all(keys.map(getInterest)),
  {
    cacheKeyFn: id =>
      `/lists/${process.env.LIST_ID}/interest-categories/.../interests/${id}/`,
    cacheMap
  }
);

interestLoader.loadMany = interestLoader.loadMany.bind(interestLoader);

const getAllInterests = new DataLoader(
  keys =>
    Promise.all(
      keys.map(async () => {
        let categories = await getInterestCategories();
        let interestList = await Promise.all(
          categories.map(getInterestsByCategory)
        );
        return interestList.flat();
      })
    ),
  { cacheKeyFn: () => "allInterests", cacheMap }
);

function getInterestCategories() {
  return getList("interest-categories/", {
    key: "categories",
    count: 60
  });
}

function getInterestsByCategory(category) {
  return getList(`interest-categories/${category.id}/interests/`, {
    key: "interests",
    count: 60
  });
}

async function getInterest(id) {
  let interests = await getAllInterests.load("__all__");
  return interests.find(interest => interest.id === id);
}

export default interestLoader;
