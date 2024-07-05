import * as papa from "papaparse";

import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";

import { aggregateProperty, exportToCSV, getUniqueItems, sumValue } from "./report-utils";

class MockFileDownloadService implements FileDownloadService {
  download(options: { fileName: string; blobData: string; blobOptions: { type: string } }) {}
}

jest.mock("papaparse", () => ({
  unparse: jest.fn(),
}));

describe("getUniqueItems", () => {
  it("should return unique items based on a specified key", () => {
    const items = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 1, name: "Item 1 Duplicate" },
    ];

    const uniqueItems = getUniqueItems(items, (item) => item.id);

    expect(uniqueItems).toEqual([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);
  });

  it("should return an empty array when input is empty", () => {
    const items: { id: number; name: string }[] = [];

    const uniqueItems = getUniqueItems(items, (item) => item.id);

    expect(uniqueItems).toEqual([]);
  });
});

describe("sumValue", () => {
  it("should return the sum of all values of a specified property", () => {
    const items = [{ value: 10 }, { value: 20 }, { value: 30 }];

    const sum = sumValue(items, (item) => item.value);

    expect(sum).toBe(60);
  });

  it("should return 0 when input is empty", () => {
    const items: { value: number }[] = [];

    const sum = sumValue(items, (item) => item.value);

    expect(sum).toBe(0);
  });

  it("should handle negative numbers", () => {
    const items = [{ value: -10 }, { value: 20 }, { value: -5 }];

    const sum = sumValue(items, (item) => item.value);

    expect(sum).toBe(5);
  });
});

describe("aggregateProperty", () => {
  it("should aggregate a specified property from an array of objects", () => {
    const items = [{ values: [1, 2, 3] }, { values: [4, 5, 6] }];

    const aggregated = aggregateProperty(items, "values");

    expect(aggregated).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should return an empty array when input is empty", () => {
    const items: { values: number[] }[] = [];

    const aggregated = aggregateProperty(items, "values");

    expect(aggregated).toEqual([]);
  });

  it("should handle objects with empty arrays as properties", () => {
    const items = [{ values: [] }, { values: [4, 5, 6] }];

    const aggregated = aggregateProperty(items, "values");

    expect(aggregated).toEqual([4, 5, 6]);
  });
});

describe("exportToCSV", () => {
  let fileDownloadService: FileDownloadService;
  const data = [
    {
      email: "john@example.com",
      name: "John Doe",
      twoFactorEnabled: "On",
      accountRecoveryEnabled: "Off",
    },
    {
      email: "jane@example.com",
      name: "Jane Doe",
      twoFactorEnabled: "On",
      accountRecoveryEnabled: "Off",
    },
  ];

  beforeEach(() => {
    fileDownloadService = new MockFileDownloadService();
  });

  test("exportToCSV should correctly export data to CSV format", () => {
    const mockExportData = [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ];
    const spy = jest.spyOn(fileDownloadService, "download");
    (papa.unparse as jest.Mock).mockReturnValue("mocked CSV output");

    exportToCSV(mockExportData, "report.csv", fileDownloadService);

    expect(spy).toHaveBeenCalledWith({
      fileName: "report.csv",
      blobData: expect.any(String),
      blobOptions: { type: "text/plain" },
    });

    const csvOutput = papa.unparse(mockExportData);
    expect(spy).toHaveBeenCalledWith({
      fileName: "report.csv",
      blobData: csvOutput,
      blobOptions: { type: "text/plain" },
    });
  });

  it("should map data according to the headers and export to CSV", () => {
    const headers = {
      email: "Email Address",
      name: "Full Name",
      twoFactorEnabled: "Two-Step Login",
      accountRecoveryEnabled: "Account Recovery",
    };

    exportToCSV(data, "test.csv", fileDownloadService, headers);

    const expectedMappedData = [
      {
        "Email Address": "john@example.com",
        "Full Name": "John Doe",
        "Two-Step Login": "On",
        "Account Recovery": "Off",
      },
      {
        "Email Address": "jane@example.com",
        "Full Name": "Jane Doe",
        "Two-Step Login": "On",
        "Account Recovery": "Off",
      },
    ];

    expect(papa.unparse).toHaveBeenCalledWith(expectedMappedData);
  });

  it("should use original keys if headers are not provided", () => {
    exportToCSV(data, "test.csv", fileDownloadService);

    const expectedMappedData = [
      {
        email: "john@example.com",
        name: "John Doe",
        twoFactorEnabled: "On",
        accountRecoveryEnabled: "Off",
      },
      {
        email: "jane@example.com",
        name: "Jane Doe",
        twoFactorEnabled: "On",
        accountRecoveryEnabled: "Off",
      },
    ];

    expect(papa.unparse).toHaveBeenCalledWith(expectedMappedData);
  });

  it("should mix original keys if headers are not fully provided", () => {
    const headers = {
      email: "Email Address",
    };

    exportToCSV(data, "test.csv", fileDownloadService, headers);

    const expectedMappedData = [
      {
        "Email Address": "john@example.com",
        name: "John Doe",
        twoFactorEnabled: "On",
        accountRecoveryEnabled: "Off",
      },
      {
        "Email Address": "jane@example.com",
        name: "Jane Doe",
        twoFactorEnabled: "On",
        accountRecoveryEnabled: "Off",
      },
    ];

    expect(papa.unparse).toHaveBeenCalledWith(expectedMappedData);
  });
});
