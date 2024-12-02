export const getDatas = async (url) => {
    try {
      let { data } = await axios.get(url);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  export const postData = async (url, obj) => {
    try {
      let { data } = await axios.post(url, obj);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  export const deleteById = async (url, id) => {
    try {
      let { data } = await axios.delete(`${url}/${id}`);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  export const putById = async (url, obj, id) => {
    try {
      let { data } = await axios.put(`${url}/${id}`, obj);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  export const patchById = async (url, obj, id) => {
    try {
      let { data } = await axios.patch(`${url}/${id}`, obj);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  